export interface Location {
  country: string;
  city: string;
  latitude: number;
  longitude: number;
}

export type OrbStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
