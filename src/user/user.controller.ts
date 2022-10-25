import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFiles, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryParamsDto } from './dto/user-query-params.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { PaginateResult } from 'mongoose';
import { User } from './entities/user.entity';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { fileFilter, maxSize } from 'src/file/helpers/file-filter.helper';
import { FileService } from 'src/file/file.service';
import { IUserFiles } from './interfaces/user-files.interface';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { IUser } from 'src/auth/interfaces/user.interface';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.enum';

@Controller('user')
export class UserController {

  constructor(
    private readonly userService: UserService,
    private readonly fileService: FileService,
  ) {}

  @Auth([ ValidRoles.admin ])
  @Post()
  async create( @Body() createUserDto: CreateUserDto ) {
    return this.userService.createUserDto( createUserDto );
  }
  
  @Get()
  async findAll( @Query() userQueryParamsDto: UserQueryParamsDto ) {
    return this.userService
      .findAll<PaginateResult<User>, UserQueryParamsDto>( userQueryParamsDto );
  }

  @Get(':id')
  async findOne( @Param('id', ParseMongoIdPipe) id: string ) {
    return this.userService.findOne( id );
  }

  @Get('username/:username')
  async findByUsername( @Param('username') username: string ) {
    const user = await this.userService.findByFields([{ field: 'username', value: username }]);
    if ( !user )
      throw new NotFoundException(`doc with username: ${ username } not found`);

    return user;
  }

  @Auth()
  @Get('auth/my-profile')
  async myProfile( @GetUser() user: IUser ) {
    return { user }
  }

  @Patch(':id')
  @Auth([ ValidRoles.owner ])
  @UseInterceptors( FileFieldsInterceptor([
      { name: 'avatar', maxCount: 5 },
      { name: 'background', maxCount: 5 },
    ],{ limits: { fileSize: maxSize }, fileFilter: fileFilter }
  ))
  async update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFiles() files: IUserFiles<Express.Multer.File[]>
  ) {
    
    let user: User;
    user = await this.userService.update( id, updateUserDto );

    if ( Object.keys(files).length > 0 ) {
      const filesUploaded = await this.fileService
        .uploadFiles<IUserFiles<Express.Multer.File[]>, IUserFiles<string[]>>( files );
      
      return await this.userService.update( id, filesUploaded );
    } 
    
    return user;
  }

  @Auth([ ValidRoles.owner ])
  @Patch('remove-all-files-from/:type/:id')
  async removeAllFilesFrom( @Param('type') type: string, @Param('id', ParseMongoIdPipe) id: string ) {
    return this.userService.removeAllFilesFrom( type.toLowerCase(), id );
  }

  @Auth([ ValidRoles.owner ])
  @Patch('remove-file-from/:type/:id/:filename')
  async removeFileFrom( 
    @Param('type') type: string, 
    @Param('id', ParseMongoIdPipe) id: string,
    @Param('filename') filename: string,
  ) {
    return this.userService.removeFileFrom( type.toLowerCase(), id, filename );
  }

  @Auth([ ValidRoles.admin ])
  @Delete(':id')
  async inactive(@Param('id', ParseMongoIdPipe) id: string) {
    return this.userService.inactive( id );
  }

}