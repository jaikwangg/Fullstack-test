import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { verify } from 'jsonwebtoken'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const userCookie = cookieStore.get('session-user')
    if (!userCookie) {
      return NextResponse.json({ user: null })
    }

    let userData
    try {
      userData = JSON.parse(userCookie.value)
    } catch (err) {
      console.error('Error parsing session-user cookie:', err)
      return NextResponse.json({ user: null })
    }

    const userInDb = await prisma.user.findUnique({ where: { id: userData.id } })
    if (!userInDb) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error('Error checking session:', error)
    return NextResponse.json({ user: null })
  }
}