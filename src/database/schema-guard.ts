import { ServiceUnavailableException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

type DriverError = {
  code?: string;
  message?: string;
};

export function isSchemaNotReadyError(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }

  const driverError = error.driverError as DriverError | undefined;

  return (
    driverError?.code === '42P01' ||
    driverError?.code === '42703' ||
    driverError?.message?.includes('does not exist') === true
  );
}

export async function withSchemaFallback<T>(
  operation: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (isSchemaNotReadyError(error)) {
      return fallback;
    }

    throw error;
  }
}

export async function withSchemaReadGuard<T>(
  operation: () => Promise<T>,
  resourceLabel: string,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (isSchemaNotReadyError(error)) {
      throw new ServiceUnavailableException({
        code: 'DATA_SCHEMA_NOT_READY',
        message: `${resourceLabel} 데이터 불러오기에 실패했습니다. 운영 DB 스키마가 아직 준비되지 않았습니다.`,
      });
    }

    throw error;
  }
}

export async function withSchemaWriteGuard<T>(
  operation: () => Promise<T>,
  resourceLabel: string,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (isSchemaNotReadyError(error)) {
      throw new ServiceUnavailableException({
        code: 'DATA_SCHEMA_NOT_READY',
        message: `${resourceLabel} 데이터 처리에 실패했습니다. 운영 DB 스키마가 아직 준비되지 않았습니다.`,
      });
    }

    throw error;
  }
}
