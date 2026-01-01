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
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { responseHelper } from 'src/helpers/responses/response.helper';
import { SupabaseGuard } from 'src/auth/guards/supabase/supabase.guard';
import { CurrentUser } from 'src/helpers/decorators/current-user.decorator';
import { AdminSupabaseGuard } from 'src/auth/guards/supabase/admin-supabase.guard';
import { ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { UserPaginationDto } from './user-pagination.dto';

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.usersService.create(createUserDto);
  // }

  @Get('/me')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@CurrentUser() currentUser: any) {
    const user = await this.usersService.findOne(currentUser.id);
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

  @Get('/me/medals')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: "Get current user's earned medals" })
  @ApiResponse({ status: 200, description: "List of user's medals" })
  async getUserMedals(@CurrentUser() currentUser: any) {
    const medals = await this.usersService.getUserMedals(currentUser.id);
    return responseHelper({
      data: medals,
      message: 'User medals retrieved successfully',
      statusCode: 200,
    });
  }

  @Get('/search')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Search users by fullname or username' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async searchUsers(@Query('q') query: string) {
    const users = await this.usersService.findAll(1, 50); // fetch first 50 users for search
    const filteredUsers = users.data.filter(
      (user) =>
        user.fullname.toLowerCase().includes(query.toLowerCase()) ||
        user.username.toLowerCase().includes(query.toLowerCase()),
    );
    return responseHelper({
      data: filteredUsers,
      message: 'Users retrieved successfully',
      statusCode: 200,
    });
  }

  @Get('/:id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findUserById(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
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

  @Get()
  @UseGuards(AdminSupabaseGuard)
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 404, description: 'No users found' })
  async findAll(@Query() query: UserPaginationDto) {
    const { page = 1, limit = 10 } = query;
    const users = await this.usersService.findAll(page, limit);
    if (!users.data || users.data.length === 0) {
      return responseHelper({
        error: 'No users found',
        message: 'No users found',
        statusCode: 404,
      });
    }
    return responseHelper({
      data: users,
      message: 'Users retrieved successfully',
      statusCode: 200,
    });
  }

  @Patch('me')
  @UseGuards(SupabaseGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiConsumes('multipart/form-data')
  async updateCurrentUser(
    @CurrentUser() currentUser: any,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const user = await this.usersService.findOne(currentUser.id);
    if (!user) {
      return responseHelper({
        error: 'User not found',
        message: 'User not found',
        statusCode: 404,
      });
    }
    const imageBuffer = image?.buffer;
    const imageName = image?.originalname;
    return await this.usersService.update(currentUser.id, updateUserDto, imageBuffer, imageName);
  }

  @Patch(':id')
  @UseGuards(AdminSupabaseGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Update user by ID (admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      return responseHelper({
        error: 'User not found',
        message: 'User not found',
        statusCode: 404,
      });
    }
    const imageBuffer = image?.buffer;
    const imageName = image?.originalname;
    return await this.usersService.update(id, updateUserDto, imageBuffer, imageName);
  }

  @Delete(':id')
  @UseGuards(SupabaseGuard)
  @ApiOperation({ summary: 'Delete user by ID (own account or admin)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(@Param('id') id: string, @CurrentUser() currentUser: any) {
    if (id !== currentUser.id && currentUser.role !== 'admin') {
      return responseHelper({
        error: 'Forbidden',
        message: 'You can only delete your own account or be an admin',
        statusCode: 403,
      });
    }
    return await this.usersService.remove(id);
  }
}
