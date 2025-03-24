import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { z } from 'zod'
import { cookies } from 'next/headers';
import { TicketStatus, UserRole } from '@prisma/client';

const createTicketSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  contactInfo: z.string().min(1, 'Contact information is required'),
})

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('session-user');
    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized: no user cookie' }, { status: 401 });
    }

    const body = await req.json();


    let user;

    try {
      user = JSON.parse(userCookie.value); 
    } catch (err) {
      console.error('Invalid user cookie:', err);
      return NextResponse.json({ error: 'Invalid user cookie' }, { status: 401 });
    }

    if (!user || !user.id || !user.role) {
      return NextResponse.json({ error: 'Invalid user in cookie' }, { status: 401 });
    }

    if (user.role !== UserRole.USER) {
      return new NextResponse(
        JSON.stringify({ message: 'Forbidden: only users can create tickets' }),
        { status: 403 }
      );
    }

    const { title, description, contactInfo} = createTicketSchema.parse(body);
    if (!title || !description || !contactInfo) {
      return new NextResponse(
        JSON.stringify({ message: 'Missing title, description, or contactInfo' }),
        { status: 400 }
      );
    }


    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        contactInfo,
        status: TicketStatus.PENDING,
        userId: user.id,
      },
    })

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Error creating ticket:', error);
    return new NextResponse(JSON.stringify({ message: 'Internal server error' }), {
      status: 500,
    });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const sortBy = searchParams.get('sortBy') || 'updatedAt'
    const order = searchParams.get('order') || 'desc'

    const where = status ? { status: status as 'PENDING' | 'ACCEPTED' | 'RESOLVED' | 'REJECTED' } : {}
    const orderBy = { [sortBy]: order }

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy,
    })

    return NextResponse.json(tickets)
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 