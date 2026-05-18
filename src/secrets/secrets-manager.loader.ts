import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';

interface SecretsManagerLoadResult {
  loadedCount: number;
  appliedKeys: string[];
}

export async function loadSecretsManagerToEnv(): Promise<SecretsManagerLoadResult> {
  const secretId = process.env.DB_SECRET_ID;
  if (!secretId) {
    return { loadedCount: 0, appliedKeys: [] };
  }

  const region = process.env.AWS_REGION ?? 'ap-northeast-2';
  const client = new SecretsManagerClient({ region });
  const response = await client.send(
    new GetSecretValueCommand({ SecretId: secretId }),
  );

  if (!response.SecretString) {
    throw new Error(`[SecretsManager] Secret "${secretId}" has no SecretString`);
  }

  const secret = JSON.parse(response.SecretString) as Record<string, unknown>;
  const appliedKeys: string[] = [];

  for (const [key, value] of Object.entries(secret)) {
    process.env[key] = typeof value === 'string' ? value : String(value);
    appliedKeys.push(key);
  }

  console.log(
    `[SecretsManager] Loaded ${appliedKeys.length} keys from "${secretId}"`,
  );

  return {
    loadedCount: appliedKeys.length,
    appliedKeys,
  };
}
