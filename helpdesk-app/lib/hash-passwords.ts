import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hashPasswords() {
const users = await prisma.user.findMany()

console.log(`Found ${users.length} users to update`)

for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10)
    
    await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword }
    })
    
    console.log(`Updated password for user: ${user.username}`)
}

console.log('All passwords have been hashed')
}

hashPasswords()
.catch(error => {
    console.error('Error updating passwords:', error)
})
.finally(async () => {
    await prisma.$disconnect()
})