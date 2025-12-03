export interface CreateVerificationSessionDto {
    userId: string;
    orbId: string;
}

export function validateCreateVerificationSessionDto(data: any): CreateVerificationSessionDto {
    if (!data.userId || typeof data.userId !== 'string' || data.userId.trim().length === 0) {
        throw new Error('User ID is required and must be a non-empty string');
    }
    if (!data.orbId || typeof data.orbId !== 'string' || data.orbId.trim().length === 0) {
        throw new Error('Orb ID is required and must be a non-empty string');
    }
    return {
        userId: data.userId.trim(),
        orbId: data.orbId.trim(),
    };
}

