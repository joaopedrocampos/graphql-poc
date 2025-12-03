import { UserService } from '../application/user.service';
import { UserNotFoundError, UserEmailAlreadyExistsError } from '../domain/user.errors';

export function createUserResolvers(userService: UserService) {
    return {
        Query: {
            user: async (_: any, { id }: { id: string}) => {
                try {
                    const user = await userService.findById(id);

                    return {
                        ...user,
                        createdAt: user.createdAt.toISOString(),
                        updatedAt: user.updatedAt.toISOString(),
                    };
                } catch (error) {
                    if (error instanceof UserNotFoundError) {
                        return null
                    }

                    throw error;
                }
            },
            userByEmail: async (_: any, { email }: { email: string}) => {
                try {
                    const user = await userService.findByEmail(email);

                    return {
                        ...user,
                        createdAt: user.createdAt.toISOString(),
                        updatedAt: user.updatedAt.toISOString(),
                    };
                } catch (error) {
                    if (error instanceof UserNotFoundError) {
                        return null
                    }

                    throw error;
                }
            },
        },
        Mutation: {
            createUser: async(_: any, { name, email }: { name: string; email: string}) => {
                try {
                    const createdUser = await userService.create({ name, email });

                    return {
                        ...createdUser,
                        createdAt: createdUser.createdAt.toISOString(),
                        updatedAt: createdUser.updatedAt.toISOString(),
                    };
                } catch (error) {
                    if (error instanceof UserEmailAlreadyExistsError) {
                        throw new Error(error.message);
                    }

                    throw error;
                }
            },
        },
    }
}
