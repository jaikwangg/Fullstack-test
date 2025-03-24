# Fullstack-test

cd helpdesk-app

for docker
docker-compose up --build -d
docker-compose ps

for db
npx prisma migrate dev
npx prisma generate      

ิีbun run dev

dashboard
npx prisma studio

for hash password
npx ts-node --project ../tsconfig.scripts.json hash-passwords.ts

- Next.js 14
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM

## API Endpoints

- `POST /api/auth/login` - 
- `POST /api/auth/logout` - 
- `GET /api/auth/session` - 

- `GET /api/tickets` - Get all tickets
- `POST /api/tickets` - Create a new ticket
- `PATCH /api/tickets/[id]` - Update a ticket
- `PATCH /api/tickets/[id]/assign` - 

- `GET /api/users` - 

## Prerequisites

- Node.js (v18 or later)
- PostgreSQL
- Bun
- Docker

user

userA
userB
employeeA
employeeB
AdminC