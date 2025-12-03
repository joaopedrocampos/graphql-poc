import { OrbService } from '~/modules/orb/application/orb.service';
import { UserService } from '~/modules/user/application/user.service';
import { VerificationSessionService } from '~/modules/verification-session/application/verification-session.service';
import { VerificationSessionNotFoundError } from '~/modules/verification-session/domain/verification-session.errors';
import { VerificationSessionStatus } from '~/modules/verification-session/domain/verification-session.types';

export function createVerificationSessionResolvers(
  verificationSessionService: VerificationSessionService,
  userService: UserService,
  orbService: OrbService,
) {
  return {
    Query: {
      verificationSession: async (_parent: unknown, { id }: { id: string }) => {
        try {
          const session = await verificationSessionService.findById(id);

          return {
            ...session,
            startedAt: session.startedAt.toISOString(),
            completedAt: session.completedAt?.toISOString() || null,
            createdAt: session.createdAt.toISOString(),
            updatedAt: session.updatedAt.toISOString(),
          };
        } catch (error) {
          if (error instanceof VerificationSessionNotFoundError) {
            return null;
          }
          throw error;
        }
      },
      verificationSessionsByUser: async (_parent: unknown, { userId }: { userId: string }) => {
        const sessions = await verificationSessionService.findByUserId(userId);

        return sessions.map((session) => ({
          ...session,
          startedAt: session.startedAt.toISOString(),
          completedAt: session.completedAt?.toISOString() || null,
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
        }));
      },
    },
    Mutation: {
      createVerificationSession: async (
        _parent: unknown,
        { userId, orbId }: { userId: string; orbId: string },
      ) => {
        const session = await verificationSessionService.create({ userId, orbId });

        return {
          ...session,
          startedAt: session.startedAt.toISOString(),
          completedAt: session.completedAt?.toISOString() || null,
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
        };
      },
      completeVerificationSession: async (_parent: unknown, { id }: { id: string }) => {
        const session = await verificationSessionService.complete(id);

        return {
          ...session,
          startedAt: session.startedAt.toISOString(),
          completedAt: session.completedAt?.toISOString() || null,
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
        };
      },
      updateVerificationSessionStatus: async (
        _parent: unknown,
        { id, status }: { id: string; status: VerificationSessionStatus },
      ) => {
        const session = await verificationSessionService.updateStatus(id, status);

        return {
          ...session,
          startedAt: session.startedAt.toISOString(),
          completedAt: session.completedAt?.toISOString() || null,
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
        };
      },
    },
    VerificationSession: {
      user: async (session: { userId: string }) => {
        // ⚠️ Isso causa N+1 problem!
        // Cada sessão chama isso individualmente
        // TODO: Implementar DataLoader para resolver isso
        try {
          const user = await userService.findById(session.userId);
          return {
            ...user,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
          };
        } catch (error) {
          // Se user não existir, lança erro (será formatado pelo errorFormatter)
          throw error;
        }
      },
      orb: async (session: { orbId: string }) => {
        // ⚠️ Isso causa N+1 problem!
        // Cada sessão chama isso individualmente
        // TODO: Implementar DataLoader para resolver isso
        try {
          const orb = await orbService.findById(session.orbId);
          return {
            ...orb,
            createdAt: orb.createdAt.toISOString(),
            updatedAt: orb.updatedAt.toISOString(),
          };
        } catch (error) {
          // Se orb não existir, lança erro (será formatado pelo errorFormatter)
          throw error;
        }
      },
    },
  };
}
