import { Orb } from '~/modules/orb/domain/orb.entity';
import { OrbNotFoundError } from '~/modules/orb/domain/orb.errors';
import { OrbStatus } from '~/modules/orb/domain/orb.types';
import { IOrbRepository } from '~/modules/orb/infra/orb.repository.interface';
import { CreateOrbDto, validateCreateOrbDto } from '~/modules/orb/application/dto/create-orb.dto';

export class OrbService {
  private readonly orbRepository: IOrbRepository;

  constructor(orbRepository: IOrbRepository) {
    this.orbRepository = orbRepository;
  }

  async findById(id: string): Promise<Orb> {
    const orb = await this.orbRepository.findById(id);

    if (!orb) {
      throw new OrbNotFoundError(id);
    }

    return orb;
  }

  async create(data: CreateOrbDto): Promise<Orb> {
    const validatedData = validateCreateOrbDto(data);

    return await this.orbRepository.create(validatedData);
  }

  async updateStatus(id: string, status: OrbStatus): Promise<Orb> {
    // Validar que o orb existe antes de atualizar
    const orb = await this.orbRepository.findById(id);
    if (!orb) {
      throw new OrbNotFoundError(id);
    }

    return await this.orbRepository.updateStatus(id, status);
  }
}
