import { OrbNotFoundError } from '../../modules/orb/domain/orb.errors';
import {
  UserEmailAlreadyExistsError,
  UserNotFoundError,
} from '../../modules/user/domain/user.errors';
import {
  VerificationSessionAlreadyCompletedError,
  VerificationSessionNotFoundError,
} from '../../modules/verification-session/domain/verification-session.errors';

export enum ErrorCode {
  ORB_NOT_FOUND = 'ORB_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  VERIFICATION_SESSION_NOT_FOUND = 'VERIFICATION_SESSION_NOT_FOUND',
  VERIFICATION_SESSION_ALREADY_COMPLETED = 'VERIFICATION_SESSION_ALREADY_COMPLETED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

export function getErrorCode(error: Error): ErrorCode {
  if (error instanceof UserNotFoundError) {
    return ErrorCode.USER_NOT_FOUND;
  }

  if (error instanceof OrbNotFoundError) {
    return ErrorCode.ORB_NOT_FOUND;
  }

  if (error instanceof UserEmailAlreadyExistsError) {
    return ErrorCode.DUPLICATE_ENTRY;
  }

  if (error instanceof VerificationSessionAlreadyCompletedError) {
    return ErrorCode.VERIFICATION_SESSION_ALREADY_COMPLETED;
  }

  if (
    error.message.includes('required') ||
    error.message.includes('invalid') ||
    error.message.includes('must be')
  ) {
    return ErrorCode.VALIDATION_ERROR;
  }

  if (error instanceof VerificationSessionNotFoundError) {
    return ErrorCode.VERIFICATION_SESSION_NOT_FOUND;
  }

  return ErrorCode.INTERNAL_SERVER_ERROR;
}

export function getErrorStatus(errorCode: ErrorCode): number {
  if (errorCode === ErrorCode.DATABASE_ERROR) {
    return 500;
  }

  if (errorCode === ErrorCode.DUPLICATE_ENTRY) {
    return 409;
  }

  if (errorCode === ErrorCode.ORB_NOT_FOUND || errorCode === ErrorCode.USER_NOT_FOUND) {
    return 404;
  }

  if (errorCode === ErrorCode.INTERNAL_SERVER_ERROR) {
    return 500;
  }

  if (errorCode === ErrorCode.VALIDATION_ERROR) {
    return 400;
  }

  return 500;
}
