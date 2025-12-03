export interface CreateUserDto {
    name: string;
    email: string;
}

export function validateCreateUserDto(data: any): CreateUserDto {
    if (!data.name || typeof data.name !== 'string') {
        throw new Error('Name is required and must be a string');
    }

    if (data.name.trim().length === 0) {
        throw new Error('Name cannot be empty');
    }

    if (!data.email || typeof data.email !== 'string') {
        throw new Error('Email is required and must be a string');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        throw new Error('Invalid email format');
    }

    return {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
    };
}