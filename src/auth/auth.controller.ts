import { Controller, Get, Post, Body, Param, UseGuards, Res, Query, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { SupabaseGuard } from './guards/supabase/supabase.guard';
import type { Response } from 'express';
import { GoogleGuard } from './guards/google/google.guard';
import { ReqUserType } from './types/req.type';
import { responseHelper } from 'src/helpers/responses/response.helper';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@ApiBearerAuth()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({
    summary: 'Sign up new user',
    description: 'Creates a new user account with email verification',
  })
  @ApiResponse({
    status: 201,
    description: 'User signed up successfully. Verification email sent.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async signUp(@Body() createUserDto: CreateUserDto) {
    const result = await this.authService.signUp(createUserDto);
    return responseHelper({
      data: result,
      message: 'User signed up successfully',
      statusCode: 201,
    });
  }

  @Get('check-verification/:email')
  @ApiOperation({
    summary: 'Check email verification status',
    description: 'Checks if user email has been verified',
  })
  @ApiResponse({ status: 200, description: 'Verification status retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async checkVerification(@Param('email') email: string) {
    const result = await this.authService.checkVerification(email);
    return responseHelper({
      data: result,
      message: 'Verification status retrieved',
      statusCode: 200,
    });
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticates user and returns access token',
  })
  @ApiResponse({ status: 200, description: 'Login successful. Returns access token.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return responseHelper({
      data: result,
      message: 'Login successful',
      statusCode: 200,
    });
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Forgot password',
    description: 'Sends a password forgot email to the user',
  })
  @ApiResponse({ status: 200, description: 'Password reset email sent successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async resetPassword(@Body('dto') forgotPasswordDto: ForgotPasswordDto) {
    const result = await this.authService.resetPassword(forgotPasswordDto.email);
    return responseHelper({
      data: result,
      message: 'Password reset email sent',
      statusCode: 200,
    });
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password',
    description: 'Resets the user password',
  })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async updatePassword(@Body('dto') resetPasswordDto: ResetPasswordDto) {
    const result = await this.authService.updatePassword(resetPasswordDto);
    return responseHelper({
      data: result,
      message: 'Password updated successfully',
      statusCode: 200,
    });
  }

  @Get('logout')
  @UseGuards(SupabaseGuard)
  @ApiOperation({
    summary: 'Logout user',
    description: 'Logs out the current user and invalidates their session',
  })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logOut() {
    const result = await this.authService.logOut();
    return responseHelper({
      data: result,
      message: 'Logout successful',
      statusCode: 200,
    });
  }

  @Get('google/login')
  @ApiOperation({
    summary: 'Initiate Google OAuth login',
    description: 'Redirects to Google OAuth flow',
  })
  @ApiResponse({ status: 302, description: 'Redirects to Google OAuth' })
  async googleLogin(@Res() res: Response, @Query('redirectUrl') redirectUrl: string) {
    res.cookie('redirect_url', redirectUrl, { httpOnly: true });
    return res.redirect('/auth/google');
  }

  @Get('google/callback')
  @UseGuards(GoogleGuard)
  @ApiOperation({
    summary: 'Google OAuth callback',
    description: 'Handles Google OAuth callback and returns access token',
  })
  @ApiResponse({ status: 302, description: 'Redirects with access token' })
  async googleCallback(
    @Res() res: Response,
    @Req() req: Request & { user: ReqUserType; cookies: any },
  ) {
    const user = req.user;
    const redirectUrl = req.cookies?.redirect_url || 'http://localhost:3001/auth/success';
    const payload: ReqUserType = { email: user.email, role: 'user', id: user.id };
    const token = await this.authService.signToken(payload);
    if (token === '') {
      return res.redirect(`http://localhost:3001/auth/failure`); // wrong credentials
    }

    res.clearCookie('redirect_url');
    return res.redirect(`${redirectUrl}?accessToken=${token}`);
  }

  @Get('google')
  @UseGuards(GoogleGuard)
  @ApiOperation({
    summary: 'Google OAuth endpoint',
    description: 'Protected Google OAuth endpoint',
  })
  async googleAuth() {}
}
