import { HttpException, HttpStatus } from '@nestjs/common';

export class AuthenticationException extends HttpException {
    constructor(message = 'Authentication failed') {
        super(message, HttpStatus.UNAUTHORIZED);
    }
}

export class AuthorizationException extends HttpException {
    constructor(message = 'Access denied') {
        super(message, HttpStatus.FORBIDDEN);
    }
}

export class ValidationException extends HttpException {
    constructor(errors: string[]) {
        super(
            {
                message: 'Validation failed',
                errors,
            },
            HttpStatus.BAD_REQUEST,
        );
    }
}

export class UserNotFoundException extends HttpException {
    constructor(identifier?: string) {
        super(
            `User ${identifier ? `with identifier ${identifier}` : ''} not found`,
            HttpStatus.NOT_FOUND,
        );
    }
}

export class UserAlreadyExistsException extends HttpException {
    constructor(field?: string) {
        super(
            `User with this ${field || 'credentials'} already exists`,
            HttpStatus.CONFLICT,
        );
    }
}

export class InvalidTokenException extends HttpException {
    constructor(message = 'Invalid token') {
        super(message, HttpStatus.UNAUTHORIZED);
    }
}

export class TokenExpiredException extends HttpException {
    constructor(message = 'Token has expired') {
        super(message, HttpStatus.UNAUTHORIZED);
    }
}
