import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProfileUserDto } from './dto/create-profile-user.dto';
import { ProfileUser } from './entities/profile-user.entity';
import { UpdateProfileUserDto } from './dto/update-profile-user.dto';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/users/entities/user.entity';
import { JwtService } from 'src/utils/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ProfileUserService {
  constructor(
    @InjectRepository(ProfileUser)
    private profileUserRepository: Repository<ProfileUser>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async update(
    id: number,
    updateProfileUserDto: UpdateProfileUserDto,
  ): Promise<any> {
    // // Check if the token is valid and not expired
    const { accessToken } = updateProfileUserDto;
    const decoded = await this.jwtService.verifyJwtToken(accessToken);

    // Fetch the user details using the access token
    const user = await this.userRepository.findOne({where : {id : decoded.id} });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    updateProfileUserDto.updated_by = user.email;

    // Update the profile
    await this.profileUserRepository.update(id, updateProfileUserDto);

    // Return the updated profile
    return { message: 'Update profile successfully', statusCode: '200' };
  }

  async findByUserId(userId: number): Promise<ProfileUser> {
    return this.profileUserRepository.findOne({
      where: { user: { id: userId } },
    });
  }

  // async getUserByToken(token: string): Promise<any> {
  //   const decoded = await this.verifyJwtToken(token);
  //   const user = await this.userService.findById(decoded.userId);
  //   if (!user) {
  //     throw new UnauthorizedException('User not found');
  //   }
  //   return user;
  // }

}
