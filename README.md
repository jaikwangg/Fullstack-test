# Fullstack-test

cd helpdesk-app

docker-compose up -d

docker-compose ps

npx prisma migrate dev

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
- React Beautiful DnD

## API Endpoints

- `GET /api/tickets` - Get all tickets
- `POST /api/tickets` - Create a new ticket
- `PATCH /api/tickets/[id]` - Update a ticket

## Prerequisites

- Node.js (v18 or later)
- PostgreSQL
- Bun
- Docker