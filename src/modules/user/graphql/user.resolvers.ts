import { UserService } from '~/modules/user/application/user.service';
import { UserNotFoundError, UserEmailAlreadyExistsError } from '~/modules/user/domain/user.errors';

export function createUserResolvers(userService: UserService) {
  return {
    Query: {
      user: async (_parent: unknown, { id }: { id: string }) => {
        try {
          const user = await userService.findById(id);

          return {
            ...user,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
          };
        } catch (error) {
          if (error instanceof UserNotFoundError) {
            return null;
          }

          throw error;
        }
      },
      userByEmail: async (_parent: unknown, { email }: { email: string }) => {
        try {
          const user = await userService.findByEmail(email);

          return {
            ...user,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
          };
        } catch (error) {
          if (error instanceof UserNotFoundError) {
            return null;
          }

          throw error;
        }
      },
    },
    Mutation: {
      createUser: async (_parent: unknown, { name, email }: { name: string; email: string }) => {
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
  };
}
