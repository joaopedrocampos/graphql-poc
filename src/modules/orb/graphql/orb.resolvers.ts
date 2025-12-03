import { OrbService } from "../application/orb.service";
import { OrbNotFound } from "../domain/orb.errors";
import { OrbStatus, Location } from "../domain/orb.types";

export function createOrbResolvers(orbService: OrbService) {
    return {
        Query: {
            orb: async (_: any, { id }: { id: string}) => {
                try {
                    const orb = await orbService.findById(id);

                    return {
                        ...orb,
                        createdAt: orb.createdAt.toISOString(),
                        updatedAt: orb.updatedAt.toISOString(),
                    };
                } catch (error) {
                    if (error instanceof OrbNotFound) {
                        return null;
                    }

                    throw error;
                }
            },
        },
        Mutation: {
            createOrb: async (
                _: any,
                {
                    serialNumber,
                    status,
                    location,
                }: {
                    serialNumber: string,
                    status: OrbStatus,
                    location: Location,
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
                    if (error instanceof OrbNotFound) {
                        throw new Error(error.message);
                    }

                    throw error;
                }
            },
            updateOrbStatus: async (
                _: any,
                { id, status }: { id: string, status: OrbStatus },
            ) => {
                try {
                    const updatedOrb = await orbService.updateStatus(id, status);

                    return {
                        ...updatedOrb,
                        createdAt: updatedOrb.createdAt.toISOString(),
                        updatedAt: updatedOrb.updatedAt.toISOString(),
                    };
                } catch (error) {
                    if (error instanceof OrbNotFound) {
                        throw new Error(error.message);
                    }

                    throw error;
                }
            },
        },
    };
};