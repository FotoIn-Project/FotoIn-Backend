import {
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
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
  ) {}


  async updateProfile(updateProfileUserDto: UpdateProfileUserDto, currentUserId: number): Promise<any> {
    const { ...updateData } = updateProfileUserDto;

    // Fetch the user details using the current user ID
    const user = await this.userRepository.findOne({ where: { id: currentUserId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Set the updated_by field to the user's email
    updateData.updated_by = user.email;

    // Fetch the profile using the user relation
    const profile = await this.profileUserRepository.findOne({ where: { user: { id: currentUserId } } });
    if (!profile) {
      throw new UnauthorizedException('Profile not found');;
    }

    // Update the profile
    Object.assign(profile, updateData);
    await this.profileUserRepository.save(profile);

    // Return the updated profile
    return { message: 'Update profile successfully', statusCode: 200 };
  }


  async findProfileByUserId(currentUserId : number): Promise<ProfileUser> {
    return this.profileUserRepository.findOne({
      where: { user: { id: currentUserId } },
    });
  }


}
