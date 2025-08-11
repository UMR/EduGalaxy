import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
    Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './services/auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto';
import { ApiResponse } from '../common/dto/api-response.dto';
import type { ILoginResponse, ITokens, IUserResponse, IAuthPayload } from '../common/interfaces';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register a new user', description: 'Create a new user account' })
    @ApiBody({ type: RegisterDto })
    @SwaggerResponse({ status: 201, description: 'User registered successfully' })
    @SwaggerResponse({ status: 400, description: 'Invalid input data' })
    @SwaggerResponse({ status: 409, description: 'User already exists' })
    async register(@Body() registerDto: RegisterDto): Promise<ApiResponse<IUserResponse>> {
        const user = await this.authService.register(registerDto);
        return ApiResponse.success(user, 'User registered successfully');
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'User login', description: 'Authenticate user and return JWT tokens' })
    @ApiBody({ type: LoginDto })
    @SwaggerResponse({ status: 200, description: 'Login successful' })
    @SwaggerResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Body() loginDto: LoginDto): Promise<ApiResponse<ILoginResponse>> {
        const result = await this.authService.login(loginDto);
        return ApiResponse.success(result, 'Login successful');
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh tokens', description: 'Get new access token using refresh token' })
    @ApiBody({ type: RefreshTokenDto })
    @SwaggerResponse({ status: 200, description: 'Tokens refreshed successfully' })
    @SwaggerResponse({ status: 401, description: 'Invalid refresh token' })
    async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<ApiResponse<ITokens>> {
        const tokens = await this.authService.refreshTokens(refreshTokenDto.refreshToken);
        return ApiResponse.success(tokens, 'Tokens refreshed successfully');
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get user profile', description: 'Get the profile of the authenticated user' })
    @SwaggerResponse({ status: 200, description: 'Profile retrieved successfully' })
    @SwaggerResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
    async getProfile(@CurrentUser() user: IAuthPayload): Promise<ApiResponse<IUserResponse | null>> {
        const userProfile = await this.authService.validateUser(user.sub);
        return ApiResponse.success(userProfile, 'Profile retrieved successfully');
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get current user', description: 'Get basic info about the currently authenticated user' })
    @SwaggerResponse({ status: 200, description: 'Current user info retrieved successfully' })
    @SwaggerResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
    async getCurrentUser(@CurrentUser() user: IAuthPayload): Promise<ApiResponse<IAuthPayload>> {
        return ApiResponse.success(user, 'Current user retrieved successfully');
    }
}
