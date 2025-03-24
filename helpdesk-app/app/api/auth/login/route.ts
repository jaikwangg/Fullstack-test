// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../../lib/prisma'; 

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Missing username or password' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials (user not found)' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials (wrong password)' }, { status: 401 });
    }

    const userCookieData = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    cookies().set({
      name: 'session-user',
      value: JSON.stringify(userCookieData),
      httpOnly: true,
      maxAge: 60 * 60 * 24, 
      secure: true, 
    });

    return NextResponse.json({ message: 'Login successful' }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
