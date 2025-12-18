import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    
    return NextResponse.json({
      message: 'Admin access granted',
      data: {
        // Add admin-specific data here
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }
}
