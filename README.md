# Kalakriti Dashboard

This application is designed to be a local first dashboard for Kalakriti where in the app will continue to work even when the internet is down. The app will sync with the server once the internet is back up.

## Preqrequisites

```bash
# Install bun
curl -fsSL https://bun.sh/install | bash

# Install docker or install docker desktop

# Clone the repo
git clone https://github.com/somus/kalakriti.git

# Install dependencies
bun install

# Copy the .env.example to .env.local and update values of ZERO_AUTH_JWKS_URL and VITE_CLERK_PUBLISHABLE_KEY
cp .env.example .env.local
```

## Running the app

```bash
# Start the database
bun db:up

# Push the schema to the database
bun db:push

# Generate the zero schema
bun generate

# Start Zero Cache and dev server
bun dev
```

## Stack

- [React](https://react.dev/)
- [React Router](https://reactrouter.com/start/declarative/installation) for routing
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Shadcn](https://shadcn.com/) for predesigned components
- [Drizzle](https://orm.drizzle.team/docs/overview) for database schema generation with postgres
- [Zero Sync](https://zero.rocicorp.dev/) is sync engine which takes care of syncing the data between the client and the server even when the internet is down
- [Clerk](https://clerk.com/docs/quickstarts/react) for authentication
- [Zod](https://zod.dev/) for schema validation
- [React Hook Form](https://react-hook-form.com/) for form handling
