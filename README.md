# Restaurant ERP System

A multi-tenant, AI-enabled Restaurant ERP system tailored for the Dubai market. Built with NestJS (backend), Next.js (frontend), PostgreSQL (database), and FastAPI (AI microservice).

## Architecture

### Multi-Tenancy Strategy

**Current (MVP):** Shared database with `tenant_id` column on every table.
- All tenants share a single PostgreSQL database
- Every table includes a `tenant_id` (UUID) column for data isolation
- Middleware automatically injects `tenant_id` into all queries
- Row-Level Security (RLS) policies enforce data isolation at the DB level

**Future Scaling:**
- Phase 2: Separate schemas per tenant (same DB, different schemas)
- Phase 3: Separate databases per tenant (full isolation for enterprise clients)
- Migration scripts will handle transitioning between strategies

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS (TypeScript) |
| Frontend | Next.js 14+ (TypeScript, App Router) |
| Database | PostgreSQL 15+ with TypeORM |
| AI Service | FastAPI (Python) with Prophet, scikit-learn |
| Auth | JWT + Passport.js with refresh tokens |
| Real-time | WebSockets (Socket.IO) |
| Styling | TailwindCSS + NextUI |
| Charts | Chart.js / react-chartjs-2 |
| Deployment | Docker + Nginx |

### Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Deep Navy | `#0F172A` | Primary |
| Emerald | `#10B981` | Accent |
| Royal Blue | `#2563EB` | Secondary |
| Soft Gray | `#F1F5F9` | Neutral/Background |

## Module Order

1. Authentication & RBAC
2. Tenants & Subscriptions
3. POS & Orders
4. Menu Management
5. Inventory & Supply Chain
6. HR & Payroll
7. Accounting & Invoices (VAT-compliant)
8. Analytics & Reporting
9. AI Forecasting
10. Super Admin Panel
11. CRM & Loyalty

## Project Structure

```
ERP-SYSTEM/
├── backend/                  # NestJS API server
│   ├── src/
│   │   ├── auth/            # Authentication & JWT
│   │   ├── users/           # User management
│   │   ├── tenants/         # Tenant management
│   │   ├── roles/           # RBAC roles & permissions
│   │   ├── orders/          # POS & order management
│   │   ├── menu/            # Menu categories & items
│   │   ├── inventory/       # Inventory tracking
│   │   ├── suppliers/       # Supplier & purchase orders
│   │   ├── hr/              # Employee, attendance, payroll
│   │   ├── accounting/      # Invoices, transactions, VAT
│   │   ├── subscription/    # SaaS plans & trials
│   │   ├── analytics/       # KPIs & reports
│   │   ├── notifications/   # Real-time notifications
│   │   ├── common/          # Shared guards, filters, middleware
│   │   └── config/          # App configuration
│   ├── test/
│   └── docker/
├── frontend/                 # Next.js web application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── layouts/         # Layout wrappers
│   │   ├── lib/             # Utilities & API client
│   │   ├── hooks/           # Custom React hooks
│   │   ├── store/           # State management
│   │   └── types/           # TypeScript types
│   └── public/
├── shared/                   # Shared types & utilities
│   └── types/
├── ai-service/              # Python AI microservice
│   ├── app/
│   ├── models/
│   └── requirements.txt
├── docker-compose.yml
├── nginx/
└── README.md
```

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Python 3.10+ (for AI service)
- Docker & Docker Compose (for deployment)

### Development

```bash
# Backend
cd backend
npm install
cp .env.example .env  # Configure database, JWT secret
npm run migration:run
npm run seed
npm run start:dev

# Frontend
cd frontend
npm install
cp .env.example .env.local
npm run dev

# AI Service
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## UAE Compliance

- **VAT:** All invoices include 5% VAT calculation with TRN (Tax Registration Number)
- **WPS:** Payroll exports compatible with Wages Protection System
- **Data Residency:** Designed for UAE-based hosting

## License

Proprietary - All rights reserved.
