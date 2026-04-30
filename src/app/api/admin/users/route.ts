/**
 * GET /api/admin/users
 * Get list of users with pagination and search
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { captureException } from '@/lib/monitoring';
import { isAdmin } from '@/lib/security';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify admin access
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const adminByEnv = isAdmin(user.id);
    if (!adminByEnv && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';

    const offset = page * limit;

    // Build query
    let query = supabase
      .from('profiles')
      .select('id, email, subscription_status, subscription_plan, credits, created_at')
      .order('created_at', { ascending: false });

    // Add search filter
    if (search) {
      query = query.ilike('email', `%${search}%`);
    }

    // Execute query with pagination
    const { data: users, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      users: users || [],
      page,
      limit,
      total: users?.length || 0,
    });
  } catch (error) {
    captureException(error as Error, { context: 'admin_users' });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
