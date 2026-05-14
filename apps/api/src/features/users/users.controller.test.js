import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./users.queries.js', () => ({
  getUserProfile:             vi.fn(),
  getActivitySummary:         vi.fn(),
  getNotificationSettings:    vi.fn(),
  getCategoryPreferences:     vi.fn(),
  checkUsernameAvailability:  vi.fn(),
  updateProfile:              vi.fn(),
  updateNotificationSettings: vi.fn(),
  updateCategoryPreferences:  vi.fn(),
  deleteAccount:              vi.fn(),
}));

let queries;
let getUserProfileHandler, getActivitySummaryHandler, updateProfileHandler;
let getNotificationsHandler, updateNotificationsHandler;
let getCategoryPrefsHandler, updateCategoryPrefsHandler;
let checkUsernameHandler, deleteAccountHandler;

const mockRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json   = vi.fn().mockReturnValue(res);
  res.end    = vi.fn().mockReturnValue(res);
  return res;
};
const next = vi.fn();

beforeEach(async () => {
  vi.resetAllMocks();
  queries = await import('./users.queries.js');
  ({
    getUserProfileHandler, getActivitySummaryHandler, updateProfileHandler,
    getNotificationsHandler, updateNotificationsHandler,
    getCategoryPrefsHandler, updateCategoryPrefsHandler,
    checkUsernameHandler, deleteAccountHandler,
  } = await import('./users.controller.js'));
});

// ---------------------------------------------------------------------------
describe('getUserProfileHandler', () => {
  it('returns profile when found', async () => {
    const profile = { user_id: 'u1', display_name: 'Alice' };
    queries.getUserProfile.mockResolvedValueOnce(profile);
    const req = { params: { id: 'u1' } };
    const res = mockRes();
    await getUserProfileHandler(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ data: profile });
  });

  it('returns 404 when not found', async () => {
    queries.getUserProfile.mockResolvedValueOnce(null);
    const req = { params: { id: 'ghost' } };
    const res = mockRes();
    await getUserProfileHandler(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 404 }));
  });
});

// ---------------------------------------------------------------------------
describe('getActivitySummaryHandler', () => {
  it('returns activity summary', async () => {
    const summary = { total_votes: 5, total_comparisons: 2 };
    queries.getActivitySummary.mockResolvedValueOnce(summary);
    const req = { params: { id: 'u1' } };
    const res = mockRes();
    await getActivitySummaryHandler(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ data: summary });
  });
});

// ---------------------------------------------------------------------------
describe('updateProfileHandler', () => {
  it('updates and returns profile', async () => {
    queries.checkUsernameAvailability.mockResolvedValueOnce(true);
    const updated = { user_id: 'u1', username: 'alice' };
    queries.updateProfile.mockResolvedValueOnce(updated);
    const req = {
      user: { id: 'u1' },
      body: { username: 'alice', displayName: 'Alice' },
    };
    const res = mockRes();
    await updateProfileHandler(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ data: updated });
  });

  it('returns 409 when username is taken', async () => {
    queries.checkUsernameAvailability.mockResolvedValueOnce(false);
    const req = { user: { id: 'u1' }, body: { username: 'taken' } };
    const res = mockRes();
    await updateProfileHandler(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 409 }));
  });

  it('returns 400 for invalid username format', async () => {
    const req = { user: { id: 'u1' }, body: { username: 'bad name!' } };
    const res = mockRes();
    await updateProfileHandler(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
  });
});

// ---------------------------------------------------------------------------
describe('getNotificationsHandler', () => {
  it('returns notification settings', async () => {
    const settings = { user_id: 'u1', email_notifications: true };
    queries.getNotificationSettings.mockResolvedValueOnce(settings);
    const req = { user: { id: 'u1' } };
    const res = mockRes();
    await getNotificationsHandler(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ data: settings });
  });
});

// ---------------------------------------------------------------------------
describe('updateNotificationsHandler', () => {
  it('updates and returns notification settings', async () => {
    const updated = { user_id: 'u1', email_notifications: false };
    queries.updateNotificationSettings.mockResolvedValueOnce(updated);
    const req = {
      user: { id: 'u1' },
      body: { emailNotifications: false, pushNotifications: true },
    };
    const res = mockRes();
    await updateNotificationsHandler(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ data: updated });
  });
});

// ---------------------------------------------------------------------------
describe('getCategoryPrefsHandler', () => {
  it('returns category preferences', async () => {
    const prefs = [{ category_id: 1, category_name: 'Tech' }];
    queries.getCategoryPreferences.mockResolvedValueOnce(prefs);
    const req = { user: { id: 'u1' } };
    const res = mockRes();
    await getCategoryPrefsHandler(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ data: prefs });
  });
});

// ---------------------------------------------------------------------------
describe('updateCategoryPrefsHandler', () => {
  it('updates and returns result', async () => {
    queries.updateCategoryPreferences.mockResolvedValueOnce({ userId: 'u1', count: 2 });
    const req = { user: { id: 'u1' }, body: { categoryIds: [1, 2] } };
    const res = mockRes();
    await updateCategoryPrefsHandler(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ data: { userId: 'u1', count: 2 } });
  });

  it('returns 400 for invalid body', async () => {
    const req = { user: { id: 'u1' }, body: { categoryIds: 'not-an-array' } };
    const res = mockRes();
    await updateCategoryPrefsHandler(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
  });
});

// ---------------------------------------------------------------------------
describe('checkUsernameHandler', () => {
  it('returns { available: true } for free username', async () => {
    queries.checkUsernameAvailability.mockResolvedValueOnce(true);
    const req = { query: { username: 'freeuser' }, user: null };
    const res = mockRes();
    await checkUsernameHandler(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ data: { available: true } });
  });

  it('returns 400 when username param missing', async () => {
    const req = { query: {}, user: null };
    const res = mockRes();
    await checkUsernameHandler(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
  });
});

// ---------------------------------------------------------------------------
describe('deleteAccountHandler', () => {
  it('returns 204 on success', async () => {
    queries.deleteAccount.mockResolvedValueOnce({ id: 'u1' });
    const req = { user: { id: 'u1' } };
    const res = mockRes();
    await deleteAccountHandler(req, res, next);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });

  it('returns 404 when user not found', async () => {
    queries.deleteAccount.mockResolvedValueOnce(null);
    const req = { user: { id: 'ghost' } };
    const res = mockRes();
    await deleteAccountHandler(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 404 }));
  });
});
