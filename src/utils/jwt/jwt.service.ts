import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const jwt = require('jsonwebtoken');

@Injectable()
export class JwtService {
  constructor(private configService: ConfigService) {}

    async generateToken(userId: string) {
        try {
          const payload = { userId: userId };
          const token = jwt.sign(payload, "123123123", {    //TODO change secrect
            expiresIn: '60s',
          });
          return token;

        } catch (error) {
          console.log('Error generate token : ', error);
          throw new Error('Failed to generate token');
        }
      }
    
      async verifyJwtToken(token: string) {
        try {
          const decoded = jwt.verify(token, "123123123");  //TODO change secrect
          console.log(decoded);
          return decoded;
        } catch (error) {
          console.log(error);
          throw new UnauthorizedException('Invalid token');
        }
      }

}
