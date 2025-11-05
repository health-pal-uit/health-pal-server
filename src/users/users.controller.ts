import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { responseHelper } from 'src/helpers/responses/response.helper';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.usersService.create(createUserDto);
  // }

  @Get()
  @UseGuards(AdminSupabaseGuard)
  findAll() {
    const users = this.usersService.findAll();
    return responseHelper({
      data: users,
      message: 'Users retrieved successfully',
      statusCode: 200,
    });
  }

  @Get(':id')
  @UseGuards(AdminSupabaseGuard)
  findOne(@Param('id') id: string) {
    const user = this.usersService.findOne(id);
    if (!user) {
      return responseHelper({
        error: 'User not found',
        message: 'User not found',
        statusCode: 404,
      });
    }
    return responseHelper({
      data: user,
      message: 'User retrieved successfully',
      statusCode: 200,
    });
  }

  @Patch(':id')
  @UseGuards(SupabaseGuard)
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const user = this.usersService.findOne(id);
    if (!user) {
      return responseHelper({
        error: 'User not found',
        message: 'User not found',
        statusCode: 404,
      });
    }
    const imageBuffer = image?.buffer;
    const imageName = image?.originalname;
    return this.usersService.update(id, updateUserDto, imageBuffer, imageName);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  remove(@Param('id') id: string, @CurrentUser() currentUser: any) {
    if (id !== currentUser.id || currentUser.role.name !== 'admin') {
      return responseHelper({
        error: 'Forbidden',
        message: 'You can only delete your own account',
        statusCode: 403,
      });
    }
    return this.usersService.remove(id);
  }
}
