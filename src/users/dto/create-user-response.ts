import { User } from "../entities/user.entity";
export interface CreateUserResponse {
    data: User;
    message: string;
    statusCode: number;
  }
  