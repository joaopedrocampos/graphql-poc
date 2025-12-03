import dotenv from 'dotenv';
import Fastify from 'fastify';
import mercurius from 'mercurius';
import { formatGraphQLError } from './graphql/errors/error.formatter';
import { resolvers, typeDefs } from './graphql/schema';

dotenv.config();

async function startServer(): Promise<void> {
  const fastify = Fastify({
    logger: true,
  });

  await fastify.register(mercurius, {
    schema: typeDefs.join('\n'),
    resolvers,
    graphiql: true,
    errorFormatter: (execution, context) => {
      const formattedErrors = execution.errors.map((error) => formatGraphQLError(error));

      fastify.log.error({
        errors: formattedErrors,
        context,
      });

      return {
        statusCode: 200,
        response: {
          errors: formattedErrors,
          data: execution.data,
        },
      };
    },
  });

  const port = parseInt(process.env['PORT'] ?? '8000');

  try {
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
}

void startServer();
