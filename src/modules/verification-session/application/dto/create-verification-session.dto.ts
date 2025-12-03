export interface CreateVerificationSessionDto {
  userId: string;
  orbId: string;
}

export function validateCreateVerificationSessionDto(data: unknown): CreateVerificationSessionDto {
  if (!data || typeof data !== 'object') {
    throw new Error('Data must be an object');
  }

  const obj = data as Partial<CreateVerificationSessionDto>;
  if (!obj.userId || typeof obj.userId !== 'string' || obj.userId.trim().length === 0) {
    throw new Error('User ID is required and must be a non-empty string');
  }
  if (!obj.orbId || typeof obj.orbId !== 'string' || obj.orbId.trim().length === 0) {
    throw new Error('Orb ID is required and must be a non-empty string');
  }
  return {
    userId: obj.userId.trim(),
    orbId: obj.orbId.trim(),
  };
}
