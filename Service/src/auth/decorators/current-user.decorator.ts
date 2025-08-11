import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IAuthPayload } from '../../common/interfaces';

export const CurrentUser = createParamDecorator(
    (data: keyof IAuthPayload | undefined, ctx: ExecutionContext): IAuthPayload | any => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        return data ? user?.[data] : user;
    },
);
