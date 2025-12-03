import { UserService } from '~/modules/user/application/user.service';
import { createUserResolvers } from '~/modules/user/graphql/user.resolvers';
import { userTypeDefs } from '~/modules/user/graphql/user.typeDefs';
import { UserRepositoryPostgres } from '~/modules/user/infra/user.repository.postgres';

import { OrbService } from '~/modules/orb/application/orb.service';
import { createOrbResolvers } from '~/modules/orb/graphql/orb.resolvers';
import { orbTypeDefs } from '~/modules/orb/graphql/orb.typeDefs';
import { OrbRepositoryPostgres } from '~/modules/orb/infra/orb.repository.postgres';

import { VerificationSessionService } from '~/modules/verification-session/application/verification-session.service';
import { createVerificationSessionResolvers } from '~/modules/verification-session/graphql/verification-session.resolvers';
import { verificationSessionTypeDefs } from '~/modules/verification-session/graphql/verification-session.typeDefs';
import { VerificationSessionRepositoryPostgres } from '~/modules/verification-session/infra/verification-session.repository.postgres';

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

export const typeDefs = [userTypeDefs, orbTypeDefs, verificationSessionTypeDefs];

export const resolvers = {
  Query: {
    ...createUserResolvers(userService).Query,
    ...createOrbResolvers(orbService).Query,
    ...createVerificationSessionResolvers(verificationSessionService, userService, orbService)
      .Query,
  },
  Mutation: {
    ...createUserResolvers(userService).Mutation,
    ...createOrbResolvers(orbService).Mutation,
    ...createVerificationSessionResolvers(verificationSessionService, userService, orbService)
      .Mutation,
  },
  VerificationSession: {
    ...createVerificationSessionResolvers(verificationSessionService, userService, orbService)
      .VerificationSession,
  },
};
