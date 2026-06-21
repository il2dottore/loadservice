import { UserService } from './services/user.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { DeleteUserDto } from './dtos/delete-user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getAllUsers(): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        username: string;
        phoneNumber: string | null;
        email: string;
        emailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getUserById(id: string): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        username: string;
        phoneNumber: string | null;
        email: string;
        emailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    create(createUserDto: CreateUserDto): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        username: string;
        phoneNumber: string | null;
        email: string;
        emailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(updateUserDto: UpdateUserDto, id: string): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        username: string;
        phoneNumber: string | null;
        email: string;
        emailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    delete(deleteUserDto: DeleteUserDto): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        username: string;
        phoneNumber: string | null;
        email: string;
        emailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
