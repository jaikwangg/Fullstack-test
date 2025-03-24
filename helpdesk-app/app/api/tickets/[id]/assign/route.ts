import { NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
// import { getSessionUser } from '@/lib/session' 
import { Params } from '../../../../../lib/type'

export async function PATCH(request: Request, { params }: Params) {
    try {
    const ticketId = params.id

    const { acceptedById } = await request.json()
    if (!acceptedById) {
        return NextResponse.json({ error: 'No acceptedById provided' }, { status: 400 })
    }

    const updatedTicket = await prisma.ticket.update({
        where: { id: ticketId },
        data: { acceptedById },
    })

    return NextResponse.json(updatedTicket, { status: 200 })
    } catch (error) {
        console.error('Error assigning ticket:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
