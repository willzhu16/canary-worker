import { describe, expect, it } from 'vitest';
import worker from '../src/index.js';
import { formatLine } from '../src/lib/log.js';
import { withSecurityHeaders } from '../src/middleware/security-headers.js';

describe('fetch handler', () => {
  const env = { PROJECT_VERSION: 'v0.0.0' };

  it('serves the root greeting', async () => {
    const response = await worker.fetch(new Request('https://canary.test/'), env);
    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toContain('canary-worker');
  });

  it('reports the release version on /healthz', async () => {
    const response = await worker.fetch(new Request('https://canary.test/healthz'), env);
    await expect(response.json()).resolves.toEqual({ version: 'v0.0.0' });
  });

  it('returns 404 for unknown routes', async () => {
    const response = await worker.fetch(new Request('https://canary.test/nope'), env);
    expect(response.status).toBe(404);
  });
});

describe('withSecurityHeaders', () => {
  it('applies the standard security headers', () => {
    const response = withSecurityHeaders(new Response('ok'));
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(response.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
  });
});

describe('formatLine', () => {
  it('emits a schema-conformant JSON line', () => {
    const parsed = JSON.parse(formatLine('info', 'v1.0.0', { event: 'test_event' }));
    expect(parsed).toMatchObject({ level: 'info', projectVersion: 'v1.0.0', event: 'test_event' });
    expect(typeof parsed.ts).toBe('string');
  });

  it('never lets caller fields shadow the schema keys', () => {
    // Regression: fields used to spread last, so a stray `level` misreported severity.
    const parsed = JSON.parse(
      formatLine('info', 'v1.0.0', { event: 'test_event', level: 'error', projectVersion: 'v9' }),
    );
    expect(parsed.level).toBe('info');
    expect(parsed.projectVersion).toBe('v1.0.0');
  });
});
