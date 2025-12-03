import { VerificationSession } from '../domain/verification-session.entity';
import { VerificationSessionNotFoundError, VerificationSessionAlreadyCompletedError } from '../domain/verification-session.errors';
import { VerificationSessionStatus } from '../domain/verification-session.types';
import { IVerificationSessionRepository } from '../domain/verification-session.repository.interface';
import { IUserRepository } from '../../user/domain/user.repository.interface';
import { IOrbRepository } from '../../orb/infra/orb.repository.interface';
import { CreateVerificationSessionDto, validateCreateVerificationSessionDto } from './dto/create-verification-session.dto';

export class VerificationSessionService {
    private readonly verificationSessionRepository: IVerificationSessionRepository;
    private readonly userRepository: IUserRepository;
    private readonly orbRepository: IOrbRepository;

    constructor(
        verificationSessionRepository: IVerificationSessionRepository,
        userRepository: IUserRepository,
        orbRepository: IOrbRepository,
    ) {
        this.verificationSessionRepository = verificationSessionRepository;
        this.userRepository = userRepository;
        this.orbRepository = orbRepository;
    }

    async findById(id: string): Promise<VerificationSession> {
        const session = await this.verificationSessionRepository.findById(id);
        if (!session) {
            throw new VerificationSessionNotFoundError(id);
        }
        return session;
    }

    async findByUserId(userId: string): Promise<VerificationSession[]> {
        return await this.verificationSessionRepository.findByUserId(userId);
    }

    async create(data: CreateVerificationSessionDto): Promise<VerificationSession> {
        const validatedData = validateCreateVerificationSessionDto(data);

        // Validar que User existe
        const user = await this.userRepository.findById(validatedData.userId);
        if (!user) {
            throw new Error(`User with id ${validatedData.userId} not found`);
        }

        // Validar que Orb existe
        const orb = await this.orbRepository.findById(validatedData.orbId);
        if (!orb) {
            throw new Error(`Orb with id ${validatedData.orbId} not found`);
        }

        return await this.verificationSessionRepository.create({
            userId: validatedData.userId,
            orbId: validatedData.orbId,
            startedAt: new Date(),
            completedAt: null,
            status: 'PENDING',
        });
    }

    async complete(id: string): Promise<VerificationSession> {
        const session = await this.verificationSessionRepository.findById(id);
        if (!session) {
            throw new VerificationSessionNotFoundError(id);
        }
        if (session.status === 'COMPLETED') {
            throw new VerificationSessionAlreadyCompletedError(id);
        }

        return await this.verificationSessionRepository.updateStatus(
            id,
            'COMPLETED',
            new Date(),
        );
    }

    async updateStatus(id: string, status: VerificationSessionStatus): Promise<VerificationSession> {
        const session = await this.verificationSessionRepository.findById(id);
        if (!session) {
            throw new VerificationSessionNotFoundError(id);
        }

        const completedAt = status === 'COMPLETED' ? new Date() : session.completedAt;
        return await this.verificationSessionRepository.updateStatus(id, status, completedAt);
    }
}

