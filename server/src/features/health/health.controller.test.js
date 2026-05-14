import { describe, it, expect, vi } from 'vitest';
import { getHealth } from './health.controller.js';

function makeRes() {
  return {
    json: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis(),
  };
}

describe('health.controller', () => {
  it('returns { data: { ok: true, ts } } on the happy path', () => {
    const res = makeRes();
    getHealth({}, res);

    expect(res.json).toHaveBeenCalledOnce();
    const payload = res.json.mock.calls[0][0];
    expect(payload).toHaveProperty('data');
    expect(payload.data.ok).toBe(true);
    expect(typeof payload.data.ts).toBe('number');
  });
});
