import { Location, OrbStatus } from '~/modules/orb/domain/orb.types';

export interface CreateOrbDto {
  serialNumber: string;
  location: Location;
  status: OrbStatus;
}

export function validateCreateOrbDto(data: unknown): CreateOrbDto {
  if (!data || typeof data !== 'object') {
    throw new Error('Data must be an object');
  }

  const obj = data as Partial<CreateOrbDto>;

  // Validar serialNumber
  if (typeof obj.serialNumber !== 'string' || obj.serialNumber.trim().length === 0) {
    throw new Error('SerialNumber is required and must be a non-empty string');
  }

  // Validar location
  if (!obj.location || typeof obj.location !== 'object') {
    throw new Error('Location is required and must be an object');
  }

  const location = obj.location;

  if (typeof location.country !== 'string' || location.country.trim().length === 0) {
    throw new Error('Location country is required and must be a non-empty string');
  }

  if (typeof location.city !== 'string' || location.city.trim().length === 0) {
    throw new Error('Location city is required and must be a non-empty string');
  }

  if (typeof location.latitude !== 'number' || location.latitude < -90 || location.latitude > 90) {
    throw new Error('Location latitude is required and must be a number between -90 and 90');
  }

  if (
    typeof location.longitude !== 'number' ||
    location.longitude < -180 ||
    location.longitude > 180
  ) {
    throw new Error('Location longitude is required and must be a number between -180 and 180');
  }

  // Validar status
  const validStatuses: OrbStatus[] = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'];
  if (!obj.status || !validStatuses.includes(obj.status)) {
    throw new Error('Status is required and must be one of: ACTIVE, INACTIVE, MAINTENANCE');
  }

  return {
    serialNumber: obj.serialNumber.trim(),
    location: {
      country: location.country.trim(),
      city: location.city.trim(),
      latitude: location.latitude,
      longitude: location.longitude,
    },
    status: obj.status,
  };
}
