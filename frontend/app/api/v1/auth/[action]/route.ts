export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  const { action } = await context.params;
  const noStore = { 'Cache-Control': 'no-store' };
  const clearCookie = `refresh_session=; Path=/api/v1/auth; Max-Age=0; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
  if (!['login', 'register', 'refresh', 'logout'].includes(action)) {
    return Response.json({ message: 'Not found' }, { status: 404, headers: noStore });
  }
  const origin = new URL(request.url).origin;
  if (request.headers.get('origin') !== origin || request.headers.get('x-csrf-protection') !== '1' ||
      !request.headers.get('content-type')?.startsWith('application/json')) {
    return Response.json({ message: 'Invalid request origin' }, { status: 403, headers: noStore });
  }
  const target = process.env.API_PROXY_TARGET ?? process.env.NEXT_PUBLIC_API_URL;
  if (!target) return Response.json({ message: 'API proxy is not configured' }, { status: 503, headers: noStore });
  try {
    const base = new URL(target);
    if (base.username || base.password || base.search || base.hash ||
        (base.protocol !== 'https:' && !(process.env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1'].includes(base.hostname) && base.protocol === 'http:'))) {
      throw new Error('Invalid upstream URL');
    }
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > 16384) {
      return Response.json({ message: 'Request too large' }, { status: 413, headers: noStore });
    }
    const headers: Record<string, string> = { 'Content-Type': 'application/json', Origin: origin, 'X-CSRF-Protection': '1' };
    // Forward only this application's refresh cookie, never Vercel or unrelated cookies.
    const cookie = request.headers.get('cookie')?.split(';').map((value) => value.trim()).find((value) => value.startsWith('refresh_session='));
    if (cookie && ['refresh', 'logout'].includes(action)) headers.Cookie = cookie;
    const upstream = await fetch(`${target.replace(/\/$/, '')}/auth/${action}`, {
      method: 'POST', headers, body, cache: 'no-store', redirect: 'manual', signal: AbortSignal.timeout(12000),
    });
    if (upstream.status >= 300 && upstream.status < 400) throw new Error('Upstream redirect');
    const responseHeaders = new Headers({ ...noStore, 'Content-Type': 'application/json' });
    for (const value of upstream.headers.getSetCookie()) responseHeaders.append('Set-Cookie', value);
    if (action === 'logout' || (action === 'refresh' && upstream.status === 401)) responseHeaders.append('Set-Cookie', clearCookie);
    return new Response(await upstream.text(), { status: upstream.status, headers: responseHeaders });
  } catch {
    return Response.json({ message: 'Authentication service unavailable' }, { status: 502, headers: { ...noStore, ...(action === 'logout' && { 'Set-Cookie': clearCookie }) } });
  }
}
