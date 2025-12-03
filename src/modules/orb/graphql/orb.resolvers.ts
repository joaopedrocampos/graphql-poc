import { OrbService } from '~/modules/orb/application/orb.service';
import { OrbNotFoundError } from '~/modules/orb/domain/orb.errors';
import { OrbStatus, Location } from '~/modules/orb/domain/orb.types';

export function createOrbResolvers(orbService: OrbService) {
  return {
    Query: {
      orb: async (_parent: unknown, { id }: { id: string }) => {
        try {
          const orb = await orbService.findById(id);

          return {
            ...orb,
            createdAt: orb.createdAt.toISOString(),
            updatedAt: orb.updatedAt.toISOString(),
          };
        } catch (error) {
          if (error instanceof OrbNotFoundError) {
            return null;
          }

          throw error;
        }
      },
    },
    Mutation: {
      createOrb: async (
        _parent: unknown,
        {
          serialNumber,
          status,
          location,
        }: {
          serialNumber: string;
          status: OrbStatus;
          location: Location;
        },
      ) => {
        try {
          const createdOrb = await orbService.create({
            serialNumber,
            status,
            location,
          });

          return {
            ...createdOrb,
            createdAt: createdOrb.createdAt.toISOString(),
            updatedAt: createdOrb.updatedAt.toISOString(),
          };
        } catch (error) {
          if (error instanceof OrbNotFoundError) {
            throw new Error(error.message);
          }

          throw error;
        }
      },
      updateOrbStatus: async (
        _parent: unknown,
        { id, status }: { id: string; status: OrbStatus },
      ) => {
        try {
          const updatedOrb = await orbService.updateStatus(id, status);

          return {
            ...updatedOrb,
            createdAt: updatedOrb.createdAt.toISOString(),
            updatedAt: updatedOrb.updatedAt.toISOString(),
          };
        } catch (error) {
          if (error instanceof OrbNotFoundError) {
            throw new Error(error.message);
          }

          throw error;
        }
      },
    },
  };
}
