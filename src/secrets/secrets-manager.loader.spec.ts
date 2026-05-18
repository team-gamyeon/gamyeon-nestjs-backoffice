import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { loadSecretsManagerToEnv } from './secrets-manager.loader';

describe('loadSecretsManagerToEnv', () => {
  const originalDbSecretId = process.env.DB_SECRET_ID;
  const originalAwsRegion = process.env.AWS_REGION;
  const originalDbUsername = process.env.DB_USERNAME;
  const originalDbPassword = process.env.DB_PASSWORD;

  beforeEach(() => {
    jest.restoreAllMocks();
    process.env.DB_SECRET_ID = 'prod/gamyeon/backoffice/db';
    process.env.AWS_REGION = 'ap-northeast-2';
    delete process.env.DB_USERNAME;
    delete process.env.DB_PASSWORD;
  });

  afterAll(() => {
    process.env.DB_SECRET_ID = originalDbSecretId;
    process.env.AWS_REGION = originalAwsRegion;
    process.env.DB_USERNAME = originalDbUsername;
    process.env.DB_PASSWORD = originalDbPassword;
  });

  it('loads secret JSON values into environment variables', async () => {
    const sendMock = jest
      .spyOn(SecretsManagerClient.prototype, 'send')
      .mockImplementation(async (command) => {
        expect(command).toBeInstanceOf(GetSecretValueCommand);
        expect((command as GetSecretValueCommand).input).toEqual({
          SecretId: 'prod/gamyeon/backoffice/db',
        });

        return {
          SecretString: JSON.stringify({
            DB_USERNAME: 'gamyeon_backoffice',
            DB_PASSWORD: 'super-secret',
          }),
        };
      });

    const result = await loadSecretsManagerToEnv();

    expect(result.loadedCount).toBe(2);
    expect(result.appliedKeys).toEqual(['DB_USERNAME', 'DB_PASSWORD']);
    expect(process.env.DB_USERNAME).toBe('gamyeon_backoffice');
    expect(process.env.DB_PASSWORD).toBe('super-secret');
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it('skips loading when no secret id is configured', async () => {
    delete process.env.DB_SECRET_ID;
    const sendMock = jest.spyOn(SecretsManagerClient.prototype, 'send');

    const result = await loadSecretsManagerToEnv();

    expect(result.loadedCount).toBe(0);
    expect(result.appliedKeys).toEqual([]);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
