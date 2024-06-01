import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ProfileUserService } from 'src/profile-user/profile-user.service';
import { AuthService } from 'src/auth/auth.service';
import { ProfileUser } from 'src/profile-user/entities/profile-user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    // private readonly userProfileService : ProfileUserService,
    // private readonly authService : AuthService,
  ) {}

  async createUser(createUserDto: any): Promise<User> {
    const queryRunner = this.usersRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create user
      const user = new User();
      user.email = createUserDto.username;
      user.password = createUserDto.password;

      const savedUser = await queryRunner.manager.save(user);

      // Create user profile
      const userProfile = new ProfileUser();
      // userProfile.firstName = createUserDto.firstName;
      // userProfile.lastName = createUserDto.lastName;
      userProfile.user = savedUser;

      await queryRunner.manager.save(userProfile);

      await queryRunner.commitTransaction();
      return savedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException('Error creating user', HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await queryRunner.release();
    }
  }



  //get all user
  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find();
    
    if (!users.length) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return this.usersRepository.find();
  }

  //get user by id
  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async remove(id: number) {
    try {
      await this.usersRepository.delete(id);
    } catch (error) {
      throw error;
    }
  }

  async findByEmail( email : string){
    return await this.usersRepository.findOne({where : {email}})
  }



}
