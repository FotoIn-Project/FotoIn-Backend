import {
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { JwtService } from 'src/utils/jwt/jwt.service';
import { Repository } from 'typeorm';
import { UpdateProfileUserDto } from './dto/update-profile-user.dto';
import { ProfileUser } from './entities/profile-user.entity';

@Injectable()
export class ProfileUserService {
  constructor(
    @InjectRepository(ProfileUser)
    private profileUserRepository: Repository<ProfileUser>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async updateProfile(updateProfileUserDto: UpdateProfileUserDto,): Promise<any> {
    
    // Check if the token is valid and not expired
    const { accessToken, ...updateData } = updateProfileUserDto;
    const decoded = await this.jwtService.verifyJwtToken(accessToken);

    // Fetch the user details using the access token
    const user = await this.userRepository.findOne({where : {id : decoded.userId} });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    updateData.updated_by = user.email;

    // Update the profile
    await this.profileUserRepository.update({ user: { id: decoded.userId } }, updateData);

    // Return the updated profile
    return { message: 'Update profile successfully', statusCode: '200' };
  }

  async findProfileByUserId(token: string): Promise<ProfileUser> {
    const decoded = await this.jwtService.verifyJwtToken(token);
    return this.profileUserRepository.findOne({
      where: { user: { id: decoded.userId } },
    });
  }


}
