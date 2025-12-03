import { IOrbRepository } from '../../modules/orb/infra/orb.repository.interface';
import { IUserRepository } from '../../modules/user/domain/user.repository.interface';
import { createOrbLoader } from './orb.loader';
import { createUserLoader } from './user.loader';

export interface Loaders {
  userLoader: ReturnType<typeof createUserLoader>;
  orbLoader: ReturnType<typeof createOrbLoader>;
}

export function createLoaders(
  userRepository: IUserRepository,
  orbRepository: IOrbRepository,
): Loaders {
  return {
    userLoader: createUserLoader(userRepository),
    orbLoader: createOrbLoader(orbRepository),
  };
}
