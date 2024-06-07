import { Injectable, UnauthorizedException } from '@nestjs/common';
const jwt = require('jsonwebtoken');

@Injectable()
export class JwtService {

    async generateToken(userId: string) {
        try {
          const payload = { userId: userId };
          const token = jwt.sign(payload, process.env.JWT_SECRECT, {
            expiresIn: '2h',
          });
          return token;
        } catch (error) {
          console.log('Error generate token : ', error);
          throw new Error('Failed to generate token');
        }
      }
    
      async verifyJwtToken(token: string) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRECT);
          return decoded;
        } catch (error) {
          throw new UnauthorizedException('Invalid token');
        }
      }
}
