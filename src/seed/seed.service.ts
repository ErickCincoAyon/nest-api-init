import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
import { UserService } from 'src/modules/user/user.service';
import { USERS_SEED } from './data/user.seed';

@Injectable()
export class SeedService {

  private users: CreateUserDto[] = USERS_SEED;

  constructor(
    private readonly userService: UserService,
  ) {}

  async executeSeed() {
    await this.userService.fillUsersWithSeed( this.users );

    return `Seed executed`;
  }
}
