import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma' 

export async function GET(request: Request) {
    try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    if (role === 'EMPLOYEE') {
        const employees = await prisma.user.findMany({
        where: { role: 'EMPLOYEE' },
        select: { id: true, username: true },
    })
        return NextResponse.json(employees)
    }

    return NextResponse.json([], { status: 200 })
    } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
