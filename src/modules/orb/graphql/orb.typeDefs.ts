export const orbTypeDefs = `
    type Location {
        country: String!
        city: String!
        latitude: Float!
        longitude: Float!
    }

    input LocationInput {
        country: String!
        city: String!
        latitude: Float!
        longitude: Float!
    }

    enum OrbStatus {
        ACTIVE
        INACTIVE
        MAINTENANCE
    }

    type Orb {
        id: ID!
        serialNumber: String!
        status: OrbStatus!
        location: Location!
        createdAt: String!
        updatedAt: String!
    }

    extend type Query {
        orb(id: ID!): Orb
    }

    extend type Mutation {
        createOrb(serialNumber: String!, status: OrbStatus!, location: LocationInput!): Orb!
        updateOrbStatus(id: ID!, status: OrbStatus!): Orb!
    }
`;