import { OrbStatus, Location } from './orb.types';

export class Orb {
    id: string;
    serialNumber: string;
    location: Location;
    status: OrbStatus
    createdAt: Date;
    updatedAt: Date;

    constructor(orb: Partial<Orb>) {
        this.id = orb.id || "";
        this.serialNumber = orb.serialNumber || "";
        this.location = orb.location || {
            country: "",
            city: "",
            latitude: 0,
            longitude: 0,
        };
        this.status = orb.status || "INACTIVE";
        this.createdAt = orb.createdAt || new Date();
        this.updatedAt = orb.updatedAt || new Date();
    }
}