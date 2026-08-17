import { AuthGuard } from "@nestjs/passport";
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from "@nestjs/core";
import { Role } from "prisma-client/client";
import { ROLES_KEYS } from "../decorators/roles.decorator";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector){}
  canActivate(
    context: ExecutionContext,
  ): boolean {
//const request = context.switchToHttp().getRequest();
    const requireRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEYS,[
        context.getHandler(),
        context.getClass(),
    ]);
    
    if(!requireRoles) {
        return true;
    }

    const {user} = context.switchToHttp().getRequest();
    return requireRoles.some((role) =>user.roles === role);
  }
}
