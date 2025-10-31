import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Query,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { SupabaseGuard } from './guards/supabase/supabase.guard';
import type { Response } from 'express';
import { GoogleGuard } from './guards/google/google.guard';
import { ReqUserType } from './types/req.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Post()
  // create(@Body() createAuthDto: CreateAuthDto) {
  //   return this.authService.create(createAuthDto);
  // }

  // @Get()
  // findAll() {
  //   return this.authService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }

  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Get('check-verification/:email')
  async checkVerification(@Param('email') email: string) {
    return this.authService.checkVerification(email);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('logout')
  @UseGuards(SupabaseGuard)
  async logOut() {
    return this.authService.logOut();
  }

  // @Get('google/login')
  // async googleLogin() {
  //   return "hello";
  // }

  // no guard here, to initiate the OAuth2 flow
  @Get('google/login')
  async googleLogin(@Res() res: Response, @Query('redirectUrl') redirectUrl: string) {
    res.cookie('redirect_url', redirectUrl, { httpOnly: true });
    return res.redirect('/auth/google');
  }

  @Get('google/callback')
  @UseGuards(GoogleGuard)
  async googleCallback(@Res() res: Response, @Req() req: any) {
    const user = req.user;
    // generate a JWT token for the user
    const redirectUrl = req.cookies.redirect_url || 'http://localhost:3001/auth/success';
    // sign the token
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
  async googleAuth() {}
}
