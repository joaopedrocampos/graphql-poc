// EXEMPLO: Como a entidade Verification deve ser estruturada
//
// ✅ CORRETO: Apenas IDs, sem importar User ou Orb
//
// export class Verification {
//   id: string;
//   userId: string;        // Referência ao User (apenas ID)
//   orbId: string;         // Referência ao Orb (apenas ID)
//   status: string;
//   createdAt: Date;
//   updatedAt: Date;
//
//   constructor(data: Partial<Verification>) {
//     this.id = data.id || '';
//     this.userId = data.userId || '';
//     this.orbId = data.orbId || '';
//     this.status = data.status || '';
//     this.createdAt = data.createdAt || new Date();
//     this.updatedAt = data.updatedAt || new Date();
//   }
// }
//
// ❌ ERRADO seria:
// import { User } from '../../user/domain/user.entity';
// import { Orb } from '../../orb/domain/orb.entity';
//
// export class Verification {
//   user: User;  // ❌ Acoplamento direto - quebra Clean Architecture
//   orb: Orb;    // ❌ Acoplamento direto - quebra Clean Architecture
// }
