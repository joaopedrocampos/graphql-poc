// EXEMPLO: Como o Service deve injetar dependências de outros módulos
//
// import { IVerificationRepository } from '../domain/verification.repository.interface';
// import { Verification } from '../domain/verification.entity';
// import { CreateVerificationDto } from './dto/create-verification.dto';
//
// // ✅ CORRETO: Importar APENAS interfaces de outros módulos
// import { IUserRepository } from '../../user/domain/user.repository.interface';
// import { IOrbRepository } from '../../orb/domain/orb.repository.interface';
//
// export class VerificationService {
//   constructor(
//     private readonly verificationRepository: IVerificationRepository,
//     // ✅ Injetar interfaces dos outros módulos (não as entidades!)
//     private readonly userRepository: IUserRepository,
//     private readonly orbRepository: IOrbRepository,
//   ) {}
//
//   async create(data: CreateVerificationDto): Promise<Verification> {
//     // 1. Validar que User existe
//     const user = await this.userRepository.findById(data.userId);
//     if (!user) {
//       throw new Error(`User with id ${data.userId} not found`);
//     }
//
//     // 2. Validar que Orb existe
//     const orb = await this.orbRepository.findById(data.orbId);
//     if (!orb) {
//       throw new Error(`Orb with id ${data.orbId} not found`);
//     }
//
//     // 3. Criar Verification (apenas com IDs)
//     return await this.verificationRepository.create({
//       userId: data.userId,
//       orbId: data.orbId,
//       status: data.status,
//     });
//   }
//
//   async findByIdWithDetails(id: string): Promise<{
//     verification: Verification;
//     user: any;
//     orb: any;
//   }> {
//     const verification = await this.findById(id);
//
//     // Buscar dados dos outros módulos através das interfaces
//     const user = await this.userRepository.findById(verification.userId);
//     const orb = await this.orbRepository.findById(verification.orbId);
//
//     return {
//       verification,
//       user,
//       orb,
//     };
//   }
// }
//
// ❌ ERRADO seria:
// import { User } from '../../user/domain/user.entity';  // ❌ Importar entidade
// import { Orb } from '../../orb/domain/orb.entity';    // ❌ Importar entidade
//
// export class VerificationService {
//   constructor(
//     private userRepo: UserRepository,  // ❌ Depender de implementação concreta
//     private orbRepo: OrbRepository,   // ❌ Depender de implementação concreta
//   ) {}
// }
