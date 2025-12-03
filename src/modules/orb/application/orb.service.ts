import { Orb } from "../domain/orb.entity";
import { OrbNotFound } from "../domain/orb.errors";
import { OrbStatus } from "../domain/orb.types";
import { IOrbRepository } from "../infra/orb.repository.interface";
import { CreateOrbDto, validateCreateOrbDto } from "./dto/create-orb.dto";

export class OrbService {
    private readonly orbRepository: IOrbRepository;

    constructor(orbRepository: IOrbRepository) {
        this.orbRepository = orbRepository;
    }

    async findById(id: string): Promise<Orb> {
        const orb = await this.orbRepository.findById(id);

        if (!orb) {
            throw new OrbNotFound(id);
        }

        return orb;
    }

    async create(data: CreateOrbDto): Promise<Orb> {
        const validatedData = validateCreateOrbDto(data);

        return await this.orbRepository.create(validatedData);
    }

    async updateStatus(id: string, status: OrbStatus): Promise<Orb> {
        return await this.orbRepository.updateStatus(id, status);
    }
}