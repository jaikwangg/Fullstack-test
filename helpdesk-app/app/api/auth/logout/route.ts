import { NextResponse } from 'next/server'
import { cookies } from 'next/headers';

export async function POST() {
  try {
    cookies().set({
      name: 'session-user',
      value: '',
      maxAge: 0, 
    });

    return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 