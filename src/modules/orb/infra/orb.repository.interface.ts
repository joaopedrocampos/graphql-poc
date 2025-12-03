import { Orb } from '~/modules/orb/domain/orb.entity';
import { OrbStatus } from '~/modules/orb/domain/orb.types';

export interface IOrbRepository {
  findById(id: string): Promise<Orb | null>;
  create(orb: Omit<Orb, 'id' | 'createdAt' | 'updatedAt'>): Promise<Orb>;
  updateStatus(id: string, status: OrbStatus): Promise<Orb>;
}
