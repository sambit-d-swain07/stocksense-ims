# Odoo Hackathon Application Scaffold

A unified Next.js 14 (App Router) starter project with Prisma ORM, PostgreSQL (Neon), JWT Authentication, Zod Validation, and Tailwind CSS.

---

## 📁 Repository Structure

```
odoo-hack/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Home / Dashboard
│   │   ├── login/page.tsx            # Login Page
│   │   ├── register/page.tsx         # Registration Page
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── register/route.ts # POST /api/auth/register
│   │       │   ├── login/route.ts    # POST /api/auth/login
│   │       │   └── me/route.ts       # GET /api/auth/me
│   │       └── upload/route.ts       # File upload stub pattern
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx            # Navigation Bar with Auth state
│   │   │   └── AppShell.tsx          # Global Page Shell Wrapper
│   │   └── ui/
│   │       ├── Button.tsx            # Reusable Button
│   │       ├── Input.tsx             # Reusable Input with Error Display
│   │       ├── Card.tsx              # Reusable Card Container
│   │       ├── Spinner.tsx           # Loading Spinner
│   │       └── Toast.tsx             # Toast Alert Banner
│   ├── context/
│   │   └── AuthContext.tsx           # React Context for JWT Auth
│   └── lib/
│       ├── prisma.ts                 # Prisma Client Singleton
│       ├── jwt.ts                    # JWT signing & verification helpers
│       └── validate.ts               # Reusable Zod request validator
├── prisma/
│   └── schema.prisma                 # Database schema (User model)
├── .env.example                      # Environment variables template
└── README.md                         # Setup & Execution instructions
```

---

## 🚀 Quick Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and set your Neon PostgreSQL database connection string and JWT secret:
```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

Ensure `.env` contains:
```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
JWT_SECRET="your-secure-jwt-secret-key"
```

### 3. Initialize Prisma & Run Migrations
Generate Prisma Client and push/migrate schema to your database:
```bash
# Push schema directly (fast for hackathons)
npx prisma db push

# Or run standard migration
npx prisma migrate dev --name init
```

### 4. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to test registration, login, and navbar state.

---

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database ORM**: Prisma ORM
- **Authentication**: JWT (`jsonwebtoken` + `bcryptjs`) stored in `localStorage`
- **Validation**: Zod
