import { User } from '../schemas/user.schema';
import { UserRepository } from '../user.repository';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
export declare class UserService {
    private readonly userRepository;
    constructor(userRepository: UserRepository);
    getAll(): Promise<User[]>;
    getById(id: string): Promise<User | null>;
    create(createUserDto: CreateUserDto): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User | null>;
    delete(id: string): Promise<User | null>;
}
