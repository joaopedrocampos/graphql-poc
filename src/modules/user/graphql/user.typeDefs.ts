export const userTypeDefs = `
    type User {
        id: ID!
        name: String!
        email: String!
        createdAt: String!
        updatedAt: String!
    }

    type Query {
        user(id: ID!): User
        userByEmail(email: String!): User
    }

    type Mutation {
        createUser(name: String!, email: String!): User!
    }
`;
