# 🎨 Kalakriti Dashboard

> Digital event management platform for Proud Indian's annual cultural festival

## 📖 About

**Kalakriti** is a single-day cultural event organized by Proud Indian, a Bangalore-based charity that brings together 400+ children from various organizations across the city for dance, music, and art competitions. These children typically don't have access to such platforms to showcase their talents.

The event involves 200+ volunteers and 4 months of preparation. This application digitizes the entire event management process, replacing error-prone Google Sheets and scattered communications with a unified, real-time system.

## ✨ Features

### Event Management

- Create and manage dance, music, and art competitions
- Organize events by categories and age groups
- Assign coordinators and volunteers to events
- Real-time event scheduling and tracking
- Support for individual and group events
- Gender-specific and mixed-gender event configurations

### Participant Management

- Register 400+ participants from multiple centers
- Track participant categories by age and gender
- Generate QR-coded ID cards (PDF)
- Monitor check-in, food consumption, and pickup status
- Track participant attendance at events
- Record winners and runners-up

### Center & Liaison Coordination

- Manage multiple charity organizations (centers)
- Assign liaisons to accompany children throughout the day
- Track center-wise participant lists
- Center-specific event registrations
- Lock centers to prevent modifications during event day

### Inventory Management

- Track event materials and supplies
- Record transactions (purchases, dispatches, returns)
- Link inventory to specific events
- Monitor stock levels in real-time
- Track inventory costs and adjustments

### Food Distribution

- Track breakfast and lunch distribution
- Monitor participant and volunteer meals
- Real-time consumption tracking
- Prevent duplicate meal distribution

### Awards & Judging

- Record winners and runners-up
- Track prize distribution status
- Upload score sheets and submission photos
- QR scanning for quick participant lookup

### User & Role Management

- Role-based access control (Admin, Volunteer, Judge)
- Team assignments (Events, Arts, Cultural, Liaison, Transport, Venue, Food, Logistics, Awards, Hospitality, Media, Fundraising)
- Volunteer task assignments and coordination
- Team leader designation

### Dashboard & Analytics

- Real-time event statistics
- Participant attendance overview
- Food distribution metrics
- Event progress tracking

## 🖼️ Screenshots

### Dashboard

![Dashboard overview showing key metrics and quick actions](./dashboard-screenshot.png)

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4 + Shadcn UI components
- **Forms**: React Hook Form + Zod validation
- **Backend**: Hono (Bun runtime)
- **Database**: PostgreSQL 16 + Drizzle ORM
- **Real-time Sync**: Zero Sync by Rocicorp
- **Authentication**: Clerk
- **File Storage**: Cloudflare R2
- **Monitoring**: Sentry
- **PDF Generation**: @react-pdf/renderer
- **QR Codes**: @yudiel/react-qr-scanner + qrcode.react
- **Build Tool**: Vite 7 with React Compiler
- **Package Manager**: Bun

## 🚀 Prerequisites

- **Bun** >= 1.3.1
- **Node.js** >= 22.14.0
- **Docker Desktop** or Docker Engine
- **PostgreSQL** 16+ (runs via Docker)
- **Git**

## 📦 Installation

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Clone the repository
git clone https://github.com/somus/kalakriti.git
cd kalakriti

# Install dependencies
bun install

# Copy environment file
cp .env.example .env.local

# Update the following required variables in .env.local:
# - ZERO_AUTH_JWKS_URL (from Clerk)
# - VITE_CLERK_PUBLISHABLE_KEY (from Clerk)
# - CLERK_SECRET_KEY (from Clerk)
# - R2_* credentials (from Cloudflare R2)
# - Database credentials
```

## 🏗️ Project Structure

```
kalakriti/
├── api/                    # Hono backend server
│   ├── index.ts           # API routes & Zero sync handlers
│   └── env.server.ts      # Server environment configuration
├── shared/                # Shared code between frontend & backend
│   └── db/
│       ├── schema.ts      # Drizzle database schema
│       ├── schema.zero.ts # Zero sync schema
│       ├── mutators/      # Database mutations by entity
│       ├── queries.ts     # Database queries
│       ├── permissions.ts # Access control rules
│       └── drizzle/       # Database migrations
├── src/                   # React frontend application
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Shadcn UI components
│   │   ├── form/         # Form field components
│   │   └── data-table-filter/ # Advanced table filtering
│   ├── views/            # Page-level components
│   │   ├── DashboardView.tsx
│   │   ├── EventsView/
│   │   ├── ParticipantsView/
│   │   ├── CentersView/
│   │   ├── InventoryView/
│   │   ├── AwardsView/
│   │   ├── FoodView/
│   │   └── ...
│   ├── layout/           # Layout components
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utility functions
├── docker/               # Docker configuration
│   ├── docker-compose.yml # Local development services
│   └── seed.sql          # Database seed data
├── public/               # Static assets (logos, images)
└── .devcontainer/        # VS Code dev container config
```

## 🔧 Development

### Start the Development Environment

```bash
# 1. Start PostgreSQL database
bun db:up

# 2. Push schema to database
bun db:push

# 3. Generate Zero sync schema
bun generate

# 4. Start all services (Zero Cache, API, Frontend)
bun dev
```

The application will be available at `http://localhost:5173`

### Key Development Scripts

```bash
# Database Management
bun db:up              # Start PostgreSQL in Docker
bun db:down            # Stop PostgreSQL
bun db:push            # Push schema changes to DB
bun db:generate        # Generate Drizzle migrations
bun db:migrate         # Run migrations
bun db:studio          # Open Drizzle Studio (DB GUI)
bun db:clean           # Clean database volumes (WARNING: deletes all data)

# Development
bun dev                # Start all services (Zero Cache + API + Frontend)
bun dev:app            # Start frontend only
bun dev:api            # Start backend API only
bun zero-cache         # Start Zero Cache server only

# Build & Preview
bun build              # Build frontend for production
bun preview            # Preview production build locally
bun prod:api           # Run API in production mode

# Code Quality
bun lint               # Run ESLint + Stylelint + TypeScript checks
bun format             # Format code with Prettier
bun typecheck          # Run TypeScript type checking
bun run-eslint         # Run ESLint only
bun run-stylelint      # Run Stylelint only

# Utilities
bun generate           # Generate Zero sync schema from Drizzle
bun shadcn             # Add Shadcn UI components
bun analyze            # Analyze bundle size
bun knip               # Find unused dependencies
bun update-packages    # Update all dependencies
```

## 🔐 Authentication & Authorization

### Roles & Permissions

| Role          | Access Level    | Capabilities                                                                                        |
| ------------- | --------------- | --------------------------------------------------------------------------------------------------- |
| **Admin**     | Full access     | Manage users, centers, events, participants, inventory, and all system settings                     |
| **Volunteer** | Limited access  | Access assigned events and centers, manage participants, track activities, update food distribution |
| **Guardian**  | Center-specific | manage participants and their events                                                                |

**Note**: Judge and Guest roles exist in the schema but do not have login access to the system.

### Team Assignments

Volunteers can be assigned to specialized teams:

- Overall Coordination
- Events Management
- Arts Coordination
- Cultural Programs
- Liaison (accompanying children)
- Transport
- Venue Management
- Food Distribution
- Logistics
- Awards Ceremony
- Hospitality
- Media Coverage
- Fundraising

### Clerk Setup

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Enable email/phone authentication methods
3. Add custom fields to user public metadata:
   - `role` (string): admin | volunteer | judge
   - `leading` (string): team name if user is a team leader
4. Configure JWKS endpoint for Zero Cache authentication
5. Copy publishable key and secret key to `.env.local`

## 🌍 Environment Variables

### Required Variables

| Variable                     | Description                     | Example                                                     |
| ---------------------------- | ------------------------------- | ----------------------------------------------------------- |
| `PG_USER`                    | PostgreSQL username             | `postgres`                                                  |
| `PG_PASSWORD`                | PostgreSQL password             | `secure_password`                                           |
| `PG_DB`                      | PostgreSQL database name        | `kalakriti`                                                 |
| `ZERO_UPSTREAM_DB`           | PostgreSQL connection string    | `postgresql://user:pass@localhost:5411/kalakriti`           |
| `ZERO_CVR_DB`                | Zero CVR database connection    | Same as upstream or separate DB                             |
| `ZERO_CHANGE_DB`             | Zero change database connection | Same as upstream or separate DB                             |
| `ZERO_AUTH_JWKS_URL`         | Clerk JWKS URL                  | `https://your-app.clerk.accounts.dev/.well-known/jwks.json` |
| `ZERO_REPLICA_FILE`          | Zero replica file path          | `/tmp/zstart_replica.db`                                    |
| `VITE_PUBLIC_SERVER`         | Zero Cache server URL           | `http://localhost:4848`                                     |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key           | `pk_test_...`                                               |
| `CLERK_PUBLISHABLE_KEY`      | Clerk publishable key (API)     | `pk_test_...`                                               |
| `CLERK_SECRET_KEY`           | Clerk secret key                | `sk_test_...`                                               |

### Optional Variables

| Variable               | Description                   | Default                                 |
| ---------------------- | ----------------------------- | --------------------------------------- |
| `ZERO_MUTATE_URL`      | Zero mutate endpoint          | `http://localhost:3000`                 |
| `ZERO_GET_QUERIES_URL` | Zero queries endpoint         | `http://localhost:3000/api/get-queries` |
| `ZERO_ADMIN_PASSWORD`  | Zero Cache admin password     | -                                       |
| `R2_ACCOUNT_ID`        | Cloudflare R2 account ID      | -                                       |
| `R2_ACCESS_KEY_ID`     | R2 access key                 | -                                       |
| `R2_SECRET_KEY_ID`     | R2 secret key                 | -                                       |
| `R2_BUCKET_NAME`       | R2 bucket name                | -                                       |
| `ASSET_FOLDER`         | Folder path in R2 bucket      | -                                       |
| `VITE_IMAGE_CDN`       | CDN URL for images            | -                                       |
| `VITE_ASSET_FOLDER`    | Public asset folder path      | -                                       |
| `VITE_API_SERVER`      | API server URL                | `http://localhost:3000`                 |
| `VITE_SENTRY_DSN`      | Sentry DSN for error tracking | -                                       |
| `SENTRY_DSN`           | Sentry DSN for API errors     | -                                       |

See `.env.example` for complete list with descriptions.

## 🗄️ Database Schema

The application uses PostgreSQL with 14 main tables:

### Core Entities

- **users**: Volunteers, admins, coordinators, and judges
- **centers**: Charity organizations bringing participants
- **participants**: Children participating in events
- **events**: Competition events (dance, music, art)
- **event_categories**: Event groupings and classification
- **sub_events**: Individual event sessions by age group and time
- **participant_categories**: Age/gender-based participant groupings

### Relationships

- **event_coordinators**: Event-to-coordinator mappings
- **event_volunteers**: Event-to-volunteer assignments
- **center_liaisons**: Liaison-to-center assignments
- **center_guardians**: Guardian-to-center relationships
- **sub_event_participants**: Participant event registrations

### Inventory

- **inventory**: Event materials and supplies
- **inventory_events**: Inventory-to-event mappings
- **inventory_transactions**: Stock movements and transactions
- **inventory_transaction_events**: Transaction-to-event links

### Key Features

- Logical replication enabled for real-time sync
- Row-level security via Zero Sync permissions
- Soft deletes with timestamps
- Comprehensive foreign key relationships

Run `bun db:studio` to explore the schema visually with Drizzle Studio.

## 🚢 Deployment

### Current Production Setup

Kalakriti is deployed on **Hetzner** cloud infrastructure using **Coolify** for orchestration:

- **PostgreSQL**: Manually provisioned with logical replication enabled
- **Zero Cache**: Standalone service container
- **API Server**: Docker container built from `api/Dockerfile`
- **Frontend**: Static build deployed via CDN or served by API

### Docker Deployment

The project includes a complete Docker Compose setup for local development:

```bash
# Start all services
docker compose -p kalakriti -f docker/docker-compose.yml up -d

# View logs
docker compose -p kalakriti -f docker/docker-compose.yml logs -f

# Stop services
docker compose -p kalakriti -f docker/docker-compose.yml down
```

Services included:

- **PostgreSQL 16**: With logical replication and WAL configuration
- **Zero Cache**: Real-time sync server
- **API Server**: Hono backend with Bun runtime

### Deployment Checklist

1. **Database Setup**
   - Create PostgreSQL 16+ instance with logical replication
   - Run migrations: `bun db:migrate`
   - Configure connection pooling if needed

2. **Environment Configuration**
   - Set all production environment variables
   - Use strong passwords and rotate keys regularly
   - Configure CORS origins appropriately

3. **External Services**
   - Set up Clerk authentication project
   - Configure Cloudflare R2 bucket for file storage
   - Set up Sentry project for error monitoring (optional)

4. **Zero Cache Deployment**
   - Deploy Zero Cache server with appropriate resources
   - Configure connection to PostgreSQL
   - Set up authentication via Clerk JWKS

5. **API Deployment**
   - Build and deploy Hono API server
   - Ensure connectivity to PostgreSQL and Zero Cache
   - Configure health checks

6. **Frontend Build**
   - Build frontend: `bun build`
   - Deploy static assets to CDN or serve via API
   - Configure environment variables via build-time injection

### Coolify Setup

The project uses `nixpacks.toml` for build configuration:

- Node.js 22 and Bun runtime
- Automatic dependency detection
- Environment variable injection

## 🤝 Contributing

We welcome contributions! This project helps provide opportunities to underprivileged children through Proud Indian's Kalakriti event.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`bun lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Standards

- **ESLint**: JavaScript/TypeScript linting with strict rules
- **Stylelint**: CSS/Tailwind linting
- **Prettier**: Code formatting with import sorting
- **TypeScript**: Strict mode enabled
- **Pre-commit Hooks**: Automated via Husky and lint-staged

### Development Guidelines

- Follow the existing code structure and patterns
- Write meaningful commit messages
- Add comments for complex logic
- Keep components small and focused
- Use TypeScript types strictly
- Test your changes thoroughly

### Areas for Contribution

- Bug fixes and performance improvements
- New features for event management
- UI/UX enhancements
- Documentation improvements
- Test coverage expansion
- Accessibility improvements
- Mobile responsiveness optimization

## 🐛 Troubleshooting

### Database Connection Issues

**Problem**: Cannot connect to PostgreSQL

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart database
bun db:down && bun db:up

# Check logs for errors
docker logs kalakriti-postgres-1

# Verify connection string in .env.local
# Should match: postgresql://user:password@localhost:5411/kalakriti
```

### Zero Cache Sync Issues

**Problem**: Data not syncing or replica errors

```bash
# Clean replica file
rm -f /tmp/zstart_replica.db*

# Regenerate Zero schema
bun generate

# Restart Zero Cache
# Press Ctrl+C and re-run: bun dev
```

**Problem**: JWKS authentication errors

- Verify `ZERO_AUTH_JWKS_URL` in `.env.local`
- Check Clerk dashboard for correct JWKS URL
- Ensure Clerk application is active

### Build Errors

**Problem**: Module not found or build failures

```bash
# Clean install
bun clean
bun install

# Clear Vite cache
rm -rf node_modules/.vite

# Clear Bun cache
rm -rf ~/.bun/install/cache

# Regenerate schemas
bun generate
```

### Port Already in Use

**Problem**: Port 5173, 3000, or 4848 already in use

```bash
# Find process using port
lsof -i :5173  # or :3000, :4848

# Kill process
kill -9 <PID>

# Or use different ports via environment variables
VITE_PORT=5174 bun dev:app
```

### TypeScript Errors

**Problem**: Type errors in generated files

```bash
# Regenerate Zero schema
bun generate

# Check TypeScript configuration
bun typecheck

# Ensure all dependencies are installed
bun install
```

### Permission Denied Errors

**Problem**: Cannot read/write files during development

```bash
# Check file permissions
ls -la /tmp/zstart_replica.db*

# Fix permissions
chmod 644 /tmp/zstart_replica.db*

# Or use different replica path
export ZERO_REPLICA_FILE="./local_replica.db"
```

### Common Issues

1. **Husky pre-commit hooks failing**: Run `bun format` and `bun lint` manually to fix issues
2. **Clerk authentication not working**: Clear browser cache and cookies
3. **Images not loading**: Verify R2 credentials and CORS configuration
4. **Slow development server**: Check if Docker has sufficient memory allocated (recommend 4GB+)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

You are free to use, modify, and distribute this software for any purpose, commercial or non-commercial, as long as you include the original copyright and license notice.

## 🎯 About Proud Indian

Proud Indian is a Bangalore-based charity organization dedicated to providing opportunities for underprivileged children to showcase their talents and build confidence through cultural events and competitions.

### Get Involved

- **Volunteer**: Join the 200+ volunteers for the next Kalakriti event
- **Donate**: Support the cause and help more children participate
- **Sponsor**: Become an event sponsor or provide materials
- **Contribute**: Help improve this open-source platform

For more information about Proud Indian and upcoming events, visit [their website] or contact the organization directly.

---

**Built with ❤️ for the children of Bangalore**

_This platform powers the annual Kalakriti cultural festival, bringing joy and opportunity to 400+ underprivileged children._
