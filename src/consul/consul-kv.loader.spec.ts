import { loadConsulKvToEnv } from './consul-kv.loader';

type FetchMock = jest.Mock<Promise<Response>, [RequestInfo | URL, RequestInit?]>;

function mockResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe('loadConsulKvToEnv', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.restoreAllMocks();
    process.env.CONSUL_KV_ENABLED = 'true';
    process.env.CONSUL_HOST = 'consul';
    process.env.CONSUL_PORT = '8500';
    process.env.CONSUL_KV_PREFIX = 'gamyeon/backoffice/';
    process.env.CONSUL_KV_OVERRIDE = 'true';
    delete process.env.PORT;
    delete process.env.DB_HOST;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('loads key-values from consul prefix and maps to environment variables', async () => {
    const fetchMock: FetchMock = jest.fn().mockResolvedValue(
      mockResponse(200, [
        {
          Key: 'gamyeon/backoffice/PORT',
          Value: Buffer.from('8500').toString('base64'),
        },
        {
          Key: 'gamyeon/backoffice/db/host',
          Value: Buffer.from('db-prod').toString('base64'),
        },
      ]),
    );
    global.fetch = fetchMock as typeof fetch;

    const result = await loadConsulKvToEnv();

    expect(result.loadedCount).toBe(2);
    expect(result.appliedKeys).toEqual(['PORT', 'DB_HOST']);
    expect(process.env.PORT).toBe('8500');
    expect(process.env.DB_HOST).toBe('db-prod');
    expect(fetchMock).toHaveBeenCalledWith(
      'http://consul:8500/v1/kv/gamyeon/backoffice/?recurse=true',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('does not override existing environment variables when override is disabled', async () => {
    process.env.CONSUL_KV_OVERRIDE = 'false';
    process.env.PORT = '3002';

    const fetchMock: FetchMock = jest.fn().mockResolvedValue(
      mockResponse(200, [
        {
          Key: 'gamyeon/backoffice/PORT',
          Value: Buffer.from('8500').toString('base64'),
        },
      ]),
    );
    global.fetch = fetchMock as typeof fetch;

    const result = await loadConsulKvToEnv();

    expect(result.loadedCount).toBe(0);
    expect(result.skippedCount).toBe(1);
    expect(process.env.PORT).toBe('3002');
  });

  it('loads JSON blob values from consul and maps them to environment variables', async () => {
    process.env.CONSUL_KV_PREFIX = 'backoffice-server/';
    delete process.env.CONSUL_SERVICE_ADDRESS;
    delete process.env.JWT_EXPIRES_IN;
    delete process.env.DB_PORT;

    const fetchMock: FetchMock = jest.fn().mockResolvedValue(
      mockResponse(200, [
        {
          Key: 'backoffice-server/settings',
          Value: Buffer.from(
            JSON.stringify({
              PORT: 3002,
              SERVICE_ADDRESS: 'backoffice-api',
              CONSUL_SERVICE_NAME: 'GAMYEON-BACKOFFICE-SERVER',
            }),
          ).toString('base64'),
        },
        {
          Key: 'backoffice-server/database',
          Value: Buffer.from(
            JSON.stringify({
              DB_PORT: 5432,
              DB_DATABASE: 'gamyeon_backoffice',
            }),
          ).toString('base64'),
        },
        {
          Key: 'backoffice-server/jwt',
          Value: Buffer.from(
            JSON.stringify({
              JWT_EXPIRES_IN: '8h',
            }),
          ).toString('base64'),
        },
      ]),
    );
    global.fetch = fetchMock as typeof fetch;

    const result = await loadConsulKvToEnv();

    expect(result.loadedCount).toBe(6);
    expect(result.appliedKeys).toEqual([
      'PORT',
      'CONSUL_SERVICE_ADDRESS',
      'CONSUL_SERVICE_NAME',
      'DB_PORT',
      'DB_DATABASE',
      'JWT_EXPIRES_IN',
    ]);
    expect(process.env.PORT).toBe('3002');
    expect(process.env.CONSUL_SERVICE_ADDRESS).toBe('backoffice-api');
    expect(process.env.CONSUL_SERVICE_NAME).toBe('GAMYEON-BACKOFFICE-SERVER');
    expect(process.env.DB_PORT).toBe('5432');
    expect(process.env.DB_DATABASE).toBe('gamyeon_backoffice');
    expect(process.env.JWT_EXPIRES_IN).toBe('8h');
    expect(fetchMock).toHaveBeenCalledWith(
      'http://consul:8500/v1/kv/backoffice-server/?recurse=true',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('skips consul loading when disabled', async () => {
    process.env.CONSUL_KV_ENABLED = 'false';
    const fetchMock: FetchMock = jest.fn();
    global.fetch = fetchMock as typeof fetch;

    const result = await loadConsulKvToEnv();

    expect(result.loadedCount).toBe(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
