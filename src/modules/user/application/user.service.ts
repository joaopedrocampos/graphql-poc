import { User } from '../domain/user.entity';
import { UserEmailAlreadyExistsError, UserNotFoundError } from '../domain/user.errors';
import { IUserRepository } from '../domain/user.repository.interface';
import { CreateUserDto, validateCreateUserDto } from './dto/create-user.dto';

export class UserService {
    private readonly userRepository: IUserRepository;

    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository;
    }

    async findById(id: string): Promise<User> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new UserNotFoundError(id);
        }

        return user;
    }

    async findByEmail(email: string): Promise<User> {
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new UserNotFoundError(email);
        }

        return user;
    }

    async create(data: CreateUserDto): Promise<User> {
        const validatedData = validateCreateUserDto(data);

        const existingUser = await this.userRepository.findByEmail(validatedData.email);
        if (existingUser) {
            throw new UserEmailAlreadyExistsError(validatedData.email);
        }

        return await this.userRepository.create(validatedData);
    }
}