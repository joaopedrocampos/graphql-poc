import DataLoader from 'dataloader';
import { Orb } from '../../modules/orb/domain/orb.entity';
import { IOrbRepository } from '../../modules/orb/infra/orb.repository.interface';

async function batchOrbs(
  ids: readonly string[],
  orbRepository: IOrbRepository,
): Promise<(Orb | null)[]> {
  const orbIds = Array.from(ids);
  const orbs = await orbRepository.findByIds(orbIds);

  return orbs;
}

export function createOrbLoader(orbRepository: IOrbRepository): DataLoader<string, Orb | null> {
  const dataLoader = new DataLoader<string, Orb | null>((ids) => {
    return batchOrbs(ids, orbRepository);
  });

  return dataLoader;
}
