import { AdminSupabaseGuard } from './admin-supabase.guard';

describe('AdminSupabaseGuard', () => {
  it('should be defined', () => {
    expect(new AdminSupabaseGuard()).toBeDefined();
  });
});
