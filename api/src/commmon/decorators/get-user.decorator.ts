import { createParamDecorator, ExecutionContext } from '@nestjs/common';
//import { AuthResponseDto } from '../../modules/auth/dto/auth-response.dto';

//Thiet lap decorator de extract user tu request
export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
