import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { z } from 'zod'

const updateTicketSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  contactInfo: z.string().min(1, 'Contact information is required').optional(),
  status: z.enum(['PENDING', 'ACCEPTED', 'RESOLVED', 'REJECTED']).optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updateTicketSchema.parse(body)

    const ticket = await prisma.ticket.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json(ticket)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 