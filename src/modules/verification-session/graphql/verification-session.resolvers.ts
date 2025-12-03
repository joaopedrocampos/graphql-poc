import { VerificationSessionService } from '~/modules/verification-session/application/verification-session.service';
import {
  VerificationSessionNotFoundError,
  VerificationSessionAlreadyCompletedError,
} from '~/modules/verification-session/domain/verification-session.errors';
import { VerificationSessionStatus } from '~/modules/verification-session/domain/verification-session.types';

export function createVerificationSessionResolvers(
  verificationSessionService: VerificationSessionService,
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
        try {
          const sessions = await verificationSessionService.findByUserId(userId);
          return sessions.map((session) => ({
            ...session,
            startedAt: session.startedAt.toISOString(),
            completedAt: session.completedAt?.toISOString() || null,
            createdAt: session.createdAt.toISOString(),
            updatedAt: session.updatedAt.toISOString(),
          }));
        } catch (error) {
          throw error;
        }
      },
    },
    Mutation: {
      createVerificationSession: async (
        _parent: unknown,
        { userId, orbId }: { userId: string; orbId: string },
      ) => {
        try {
          const session = await verificationSessionService.create({ userId, orbId });
          return {
            ...session,
            startedAt: session.startedAt.toISOString(),
            completedAt: session.completedAt?.toISOString() || null,
            createdAt: session.createdAt.toISOString(),
            updatedAt: session.updatedAt.toISOString(),
          };
        } catch (error) {
          throw new Error(
            error instanceof Error ? error.message : 'Failed to create verification session',
          );
        }
      },
      completeVerificationSession: async (_parent: unknown, { id }: { id: string }) => {
        try {
          const session = await verificationSessionService.complete(id);
          return {
            ...session,
            startedAt: session.startedAt.toISOString(),
            completedAt: session.completedAt?.toISOString() || null,
            createdAt: session.createdAt.toISOString(),
            updatedAt: session.updatedAt.toISOString(),
          };
        } catch (error) {
          if (error instanceof VerificationSessionNotFoundError) {
            throw new Error(error.message);
          }
          if (error instanceof VerificationSessionAlreadyCompletedError) {
            throw new Error(error.message);
          }
          throw error;
        }
      },
      updateVerificationSessionStatus: async (
        _parent: unknown,
        { id, status }: { id: string; status: VerificationSessionStatus },
      ) => {
        try {
          const session = await verificationSessionService.updateStatus(id, status);
          return {
            ...session,
            startedAt: session.startedAt.toISOString(),
            completedAt: session.completedAt?.toISOString() || null,
            createdAt: session.createdAt.toISOString(),
            updatedAt: session.updatedAt.toISOString(),
          };
        } catch (error) {
          if (error instanceof VerificationSessionNotFoundError) {
            throw new Error(error.message);
          }
          throw error;
        }
      },
    },
  };
}
