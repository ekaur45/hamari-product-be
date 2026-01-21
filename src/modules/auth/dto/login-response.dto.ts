import User from "src/database/entities/user.entity";

export class LoginResponseDto extends User {
    access_token: string;
}