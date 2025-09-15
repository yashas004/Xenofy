# Xenofy - By Yashas Yadav
# Xenofy Frontend

The frontend application for Xenofy, a multi-tenant Shopify analytics platform built with Next.js, React, and TypeScript.

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Express.js API server
- **Deployment**: Vercel

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Backend server running (see `/backend/README.md`)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Configure `NEXT_PUBLIC_BACKEND_URL` to point to your backend server

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
frontend/
├── .env.local          # Environment variables
├── next.config.ts      # Next.js configuration
├── tsconfig.json       # TypeScript configuration
├── eslint.config.mjs   # ESLint configuration
├── postcss.config.mjs  # PostCSS configuration
├── public/             # Static assets
├── src/
│   └── app/            # Next.js App Router
│       ├── globals.css # Global styles (Tailwind CSS)
│       ├── layout.tsx  # Root layout
│       └── page.tsx    # Home page
└── package.json
```

## Build Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

```bash
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

## Contributing

1. Follow the project's coding standards
2. Run `npm run lint` before committing
3. Test your changes with both backend services

## Deployment Notes

This app is configured for Vercel deployment. Refer to the main project's `/DEPLOYMENT.md` for detailed deployment instructions.
