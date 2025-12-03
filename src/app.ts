import Fastify from 'fastify';
import dotenv from 'dotenv';
import mercurius from 'mercurius';
import { typeDefs, resolvers } from './graphql/schema';


dotenv.config();

async function startServer() {
    const fastify = Fastify({
        logger: true,
    });

    await fastify.register(mercurius, {
        schema: typeDefs.join('\n'),
        resolvers,
        graphiql: true,
    });

    const port = parseInt(process.env.PORT || '8000');

    try {
        await fastify.listen({ port, host: '0.0.0.0' });
        console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
}

startServer();