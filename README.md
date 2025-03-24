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

- `POST /api/auth/login` - Logs a user in by verifying credentials
- `POST /api/auth/logout` - Logs the user out by clearing or invalidating the session
- `GET /api/auth/session` - Returns the current user session

- `GET /api/tickets` - Get all tickets
- `POST /api/tickets` - Create a new ticket
- `PATCH /api/tickets/[id]` - Update a ticket
- `PATCH /api/tickets/[id]/assign` - Assigns a ticket to an employee

- `GET /api/users` - Lists users, optionally by role
    Query Parameters: role=EMPLOYEE – returns only employees

## Prerequisites

- Node.js (v18 or later)
- PostgreSQL
- Bun (optional)
- Docker

user

userA
userB
employeeA
employeeB
AdminC