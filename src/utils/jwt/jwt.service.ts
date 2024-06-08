import { Injectable, UnauthorizedException } from '@nestjs/common';
const jwt = require('jsonwebtoken');

@Injectable()
export class JwtService {

    async generateToken(userId: string) {
        try {
          const payload = { userId: userId };
          const token = jwt.sign(payload, process.env.JWT_SECRECT, {
            expiresIn: '6h',
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
          console.log(decoded);
          return decoded;
        } catch (error) {
          console.log(error);
          throw new UnauthorizedException('Invalid token');
        }
      }

}
