import { Location, OrbStatus } from '../../domain/orb.types';

export interface CreateOrbDto {
  serialNumber: string;
  location: Location;
  status: OrbStatus;
}

export function validateCreateOrbDto(data: any): CreateOrbDto {
  // Validar serialNumber
  if (!data.serialNumber || typeof data.serialNumber !== 'string') {
    throw new Error('SerialNumber is required and must be a string');
  }

  if (data.serialNumber.trim().length === 0) {
    throw new Error('SerialNumber cannot be empty');
  }

  // Validar location
  if (!data.location || typeof data.location !== 'object') {
    throw new Error('Location is required and must be an object');
  }

  if (!data.location.country || typeof data.location.country !== 'string') {
    throw new Error('Location country is required and must be a string');
  }

  if (data.location.country.trim().length === 0) {
    throw new Error('Location country cannot be empty');
  }

  if (!data.location.city || typeof data.location.city !== 'string') {
    throw new Error('Location city is required and must be a string');
  }

  if (data.location.city.trim().length === 0) {
    throw new Error('Location city cannot be empty');
  }

  if (typeof data.location.latitude !== 'number') {
    throw new Error('Location latitude is required and must be a number');
  }

  if (typeof data.location.longitude !== 'number') {
    throw new Error('Location longitude is required and must be a number');
  }

  // Validar latitude (-90 a 90)
  if (data.location.latitude < -90 || data.location.latitude > 90) {
    throw new Error('Latitude must be between -90 and 90');
  }

  // Validar longitude (-180 a 180)
  if (data.location.longitude < -180 || data.location.longitude > 180) {
    throw new Error('Longitude must be between -180 and 180');
  }

  // Validar status
  if (!data.status || typeof data.status !== 'string') {
    throw new Error('Status is required and must be a string');
  }

  const validStatuses: OrbStatus[] = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'];
  if (!validStatuses.includes(data.status as OrbStatus)) {
    throw new Error(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  return {
    serialNumber: data.serialNumber.trim(),
    location: {
      country: data.location.country.trim(),
      city: data.location.city.trim(),
      latitude: data.location.latitude,
      longitude: data.location.longitude,
    },
    status: data.status as OrbStatus,
  };
}

