const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');const ts=require('typescript');const axios=require('axios');
function load(relative,imports={},globals={}){
 const source=fs.readFileSync(path.join(__dirname,'..',relative),'utf8');
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
 const exports={};vm.runInNewContext(code,{exports,require:(id)=>{if(!(id in imports))throw Error(id);return imports[id];},process:{env:{NODE_ENV:'production',API_PROXY_TARGET:'https://api.example.test/api/v1',NEXT_PUBLIC_API_URL:'https://api.example.test/api/v1'}},console,Request,Response,Headers,URL,AbortSignal,TextEncoder,...globals});return exports;
}
const session={accessToken:'new-access',user:{id:'qa'}};
function denied(config){return new axios.AxiosError('Unauthorized','ERR_BAD_REQUEST',config,null,{status:401,data:{},headers:{},config});}
function setup(){
 let state={auth:{accessToken:'expired',isAuthenticated:true}};
 const store={getState:()=>state,dispatch:(action)=>{state={auth:action.type==='clear'?{}:action.payload};}};
 const actions={clearAuth:()=>({type:'clear'}),setAuth:(payload)=>({type:'set',payload})};
 const auth=load('services/api/session.ts',{'axios':axios,'@/store':{store},'@/store/slices/authSlice':actions});
 const {apiClient}=load('services/api/axios.config.ts',{'axios':axios,'@/store':{store},'./session':auth});
 return {...auth,apiClient,store};
}
test('concurrent 401 responses share one cookie refresh without any browser refresh token',async()=>{
 let refreshes=0;const x=setup();
 x.sessionClient.defaults.adapter=async(config)=>{refreshes++;assert.equal(config.withCredentials,true);assert.equal(config.headers.Authorization,undefined);assert.equal(config.headers['X-CSRF-Protection'],'1');await new Promise(resolve=>setImmediate(resolve));return {status:200,data:session,headers:{},config};};
 x.apiClient.defaults.adapter=async(config)=>{if(config.headers.Authorization!=='Bearer new-access')throw denied(config);return {status:200,data:'ok',headers:{},config};};
 await Promise.all([x.apiClient.get('/orders'),x.apiClient.get('/users/me')]);assert.equal(refreshes,1);assert.equal(x.store.getState().auth.refreshToken,undefined);
});
test('failed refresh ends the session without recursively retrying',async()=>{
 let refreshes=0,requests=0;const x=setup();x.sessionClient.defaults.adapter=async(config)=>{refreshes++;throw denied(config);};x.apiClient.defaults.adapter=async(config)=>{requests++;throw denied(config);};
 await assert.rejects(x.apiClient.get('/orders'));assert.equal(refreshes,1);assert.equal(requests,1);assert.equal(x.store.getState().auth.accessToken,undefined);
});
test('a refresh response arriving after logout cannot restore Redux authentication',async()=>{
 const x=setup();let release;const wait=new Promise(resolve=>{release=resolve;});let logoutCalls=0;
 x.sessionClient.defaults.adapter=async(config)=>{if(config.url==='/refresh'){await wait;return {status:200,data:session,headers:{},config};}logoutCalls++;return {status:200,data:{},headers:{},config};};
 const refreshing=x.refreshSession();const loggingOut=x.logoutSession();release();await Promise.all([refreshing,loggingOut]);assert.equal(logoutCalls,1);assert.equal(x.store.getState().auth.accessToken,undefined);
});
test('bootstrap restores an access token through the cookie endpoint',async()=>{
 const x=setup();x.sessionClient.defaults.adapter=async(config)=>({status:200,data:session,headers:{},config});await x.refreshSession();assert.equal(x.store.getState().auth.accessToken,'new-access');
});
test('protected requests are retried at most once',async()=>{
 const x=setup();let requests=0;x.sessionClient.defaults.adapter=async(config)=>({status:200,data:session,headers:{},config});x.apiClient.defaults.adapter=async(config)=>{requests++;throw denied(config);};await assert.rejects(x.apiClient.get('/orders'));assert.equal(requests,2);
});
const context=(action)=>({params:Promise.resolve({action})});
const req=(action,headers={})=>new Request('https://shop.example.test/api/v1/auth/'+action,{method:'POST',headers:{Origin:'https://shop.example.test','Content-Type':'application/json','X-CSRF-Protection':'1',...headers},body:'{}'});
test('BFF forwards only the refresh cookie and preserves multiple Set-Cookie headers',async()=>{
 let seen;const {POST}=load('app/api/v1/auth/[action]/route.ts',{}, {fetch:async(url,options)=>{seen={url,options};const headers=new Headers({'Content-Type':'application/json'});headers.append('Set-Cookie','refresh_session=new; HttpOnly; Secure; Path=/api/v1/auth; SameSite=Lax');headers.append('Set-Cookie','other=value; HttpOnly');return new Response(JSON.stringify(session),{status:200,headers});}});
 const response=await POST(req('refresh',{Cookie:'vercel_private=hidden; refresh_session=old'}),context('refresh'));
 assert.equal(response.status,200);assert.equal(seen.options.headers.Cookie,'refresh_session=old');assert.equal(seen.options.headers.Origin,'https://shop.example.test');assert.equal(response.headers.getSetCookie().length,2);assert.equal(response.headers.get('cache-control'),'no-store');assert.equal((await response.json()).refreshToken,undefined);
});
test('BFF blocks cross-origin requests, missing CSRF header and unknown actions before fetch',async()=>{
 let calls=0;const {POST}=load('app/api/v1/auth/[action]/route.ts',{}, {fetch:async()=>{calls++;throw Error('Must not call');}});
 assert.equal((await POST(req('refresh',{Origin:'https://evil.example'}),context('refresh'))).status,403);
 assert.equal((await POST(req('refresh',{'X-CSRF-Protection':''}),context('refresh'))).status,403);
 assert.equal((await POST(req('unexpected'),context('unexpected'))).status,404);assert.equal(calls,0);
});
test('BFF clears the local refresh cookie on logout even when upstream is unavailable',async()=>{
 const {POST}=load('app/api/v1/auth/[action]/route.ts',{}, {fetch:async()=>{throw Error('Unavailable');}});const response=await POST(req('logout'),context('logout'));assert.equal(response.status,502);assert.match(response.headers.get('set-cookie'),/Max-Age=0/);assert.match(response.headers.get('set-cookie'),/HttpOnly/);
});
