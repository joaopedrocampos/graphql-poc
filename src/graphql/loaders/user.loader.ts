import DataLoader from 'dataloader';
import { User } from '../../modules/user/domain/user.entity';
import { IUserRepository } from '../../modules/user/domain/user.repository.interface';

async function batchUsers(
  ids: readonly string[],
  userRepository: IUserRepository,
): Promise<(User | null)[]> {
  const userIds = Array.from(ids);
  const users = await userRepository.findByIds(userIds);

  return users;
}

export function createUserLoader(userRepository: IUserRepository): DataLoader<string, User | null> {
  const dataLoader = new DataLoader<string, User | null>((ids: readonly string[]) => {
    return batchUsers(ids, userRepository);
  });

  return dataLoader;
}
