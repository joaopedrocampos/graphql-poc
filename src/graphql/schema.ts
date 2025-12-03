import { userTypeDefs } from '../modules/user/graphql/user.typeDefs';
import { createUserResolvers } from '../modules/user/graphql/user.resolvers';
import { UserRepositoryPostgres } from '../modules/user/infra/user.repository.postgres';
import { UserService } from '../modules/user/application/user.service';

const userRepository = new UserRepositoryPostgres();
const userService = new UserService(userRepository);

export const typeDefs = [
    userTypeDefs,
];

export const resolvers = {
    Query: {
        ...createUserResolvers(userService).Query,
    },
    Mutation: {
        ...createUserResolvers(userService).Mutation,
    },
};
