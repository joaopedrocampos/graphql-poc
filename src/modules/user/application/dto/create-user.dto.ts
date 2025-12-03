export interface CreateUserDto {
  name: string;
  email: string;
}

export function validateCreateUserDto(data: unknown): CreateUserDto {
  if (!data || typeof data !== 'object') {
    throw new Error('Data must be an object');
  }

  const obj = data as Partial<CreateUserDto>;
  if (!obj.name || typeof obj.name !== 'string') {
    throw new Error('Name is required and must be a string');
  }

  if (obj.name.trim().length === 0) {
    throw new Error('Name cannot be empty');
  }

  if (!obj.email || typeof obj.email !== 'string') {
    throw new Error('Email is required and must be a string');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(obj.email)) {
    throw new Error('Invalid email format');
  }

  return {
    name: obj.name.trim(),
    email: obj.email.trim().toLowerCase(),
  };
}
