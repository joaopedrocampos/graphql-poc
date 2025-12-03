import { GraphQLError } from 'graphql';
import { getErrorCode, getErrorStatus } from './error.codes';

export function formatGraphQLError(error: GraphQLError): GraphQLError {
  // Tentar extrair o erro original de diferentes formas
  // Mercurius pode envolver o erro de diferentes maneiras
  let originalError: Error = error;

  // Verificar se há originalError diretamente
  if (error.originalError) {
    originalError = error.originalError;
  }
  // Verificar se há erro dentro de cause (padrão mais recente)
  else if ((error as { cause?: Error }).cause) {
    originalError = (error as { cause: Error }).cause;
  }
  // Se o próprio erro já é uma instância de Error, usar ele
  else if (error instanceof Error) {
    originalError = error;
  }

  // Se a mensagem é genérica do GraphQL, tentar usar a mensagem do originalError
  const message =
    error.message === 'Graphql validation error' || error.message === 'GraphQL error'
      ? originalError.message
      : error.message;

  const errorCode = getErrorCode(originalError);
  const errorStatus = getErrorStatus(errorCode);

  return new GraphQLError(message, {
    extensions: {
      code: errorCode,
      statusCode: errorStatus,
      timestamp: new Date().toISOString(),
      stack: originalError.stack,
    },
    originalError,
  });
}
