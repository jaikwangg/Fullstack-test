import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { z } from 'zod'

const createTicketSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  contactInfo: z.string().min(1, 'Contact information is required'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = createTicketSchema.parse(body)

    const ticket = await prisma.ticket.create({
      data: {
        ...validatedData,
        status: 'PENDING',
      },
    })

    return NextResponse.json(ticket)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
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
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 