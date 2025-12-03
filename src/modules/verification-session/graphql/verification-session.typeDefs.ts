export const verificationSessionTypeDefs = `
    enum VerificationSessionStatus {
        PENDING
        IN_PROGRESS
        COMPLETED
        FAILED
        CANCELLED
    }

    type VerificationSession {
        id: ID!
        userId: ID!
        orbId: ID!
        startedAt: String!
        completedAt: String
        status: VerificationSessionStatus!
        createdAt: String!
        updatedAt: String!
        user: User!
        orb: Orb!
    }

    extend type Query {
        verificationSession(id: ID!): VerificationSession
        verificationSessionsByUser(userId: ID!): [VerificationSession!]!
    }

    extend type Mutation {
        createVerificationSession(userId: ID!, orbId: ID!): VerificationSession!
        completeVerificationSession(id: ID!): VerificationSession!
        updateVerificationSessionStatus(id: ID!, status: VerificationSessionStatus!): VerificationSession!
    }
`;
