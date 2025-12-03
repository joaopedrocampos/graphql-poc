import { userTypeDefs } from '../modules/user/graphql/user.typeDefs';
import { createUserResolvers } from '../modules/user/graphql/user.resolvers';
import { UserRepositoryPostgres } from '../modules/user/infra/user.repository.postgres';
import { UserService } from '../modules/user/application/user.service';

import { orbTypeDefs } from '../modules/orb/graphql/orb.typeDefs';
import { createOrbResolvers } from '../modules/orb/graphql/orb.resolvers';
import { OrbRepositoryPostgres } from '../modules/orb/infra/orb.repository.postgres';
import { OrbService } from '../modules/orb/application/orb.service';

import { verificationSessionTypeDefs } from '../modules/verification-session/graphql/verification-session.typeDefs';
import { createVerificationSessionResolvers } from '../modules/verification-session/graphql/verification-session.resolvers';
import { VerificationSessionRepositoryPostgres } from '../modules/verification-session/infra/verification-session.repository.postgres';
import { VerificationSessionService } from '../modules/verification-session/application/verification-session.service';

const userRepository = new UserRepositoryPostgres();
const userService = new UserService(userRepository);

const orbRepository = new OrbRepositoryPostgres();
const orbService = new OrbService(orbRepository);

const verificationSessionRepository = new VerificationSessionRepositoryPostgres();
const verificationSessionService = new VerificationSessionService(
    verificationSessionRepository,
    userRepository,
    orbRepository,
);

export const typeDefs = [
    userTypeDefs,
    orbTypeDefs,
    verificationSessionTypeDefs,
];

export const resolvers = {
    Query: {
        ...createUserResolvers(userService).Query,
        ...createOrbResolvers(orbService).Query,
        ...createVerificationSessionResolvers(verificationSessionService).Query,
    },
    Mutation: {
        ...createUserResolvers(userService).Mutation,
        ...createOrbResolvers(orbService).Mutation,
        ...createVerificationSessionResolvers(verificationSessionService).Mutation,
    },
};
