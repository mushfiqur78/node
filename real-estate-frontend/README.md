# Real Estate Frontend

Public-facing website for the Real Estate platform built with Next.js 16, TypeScript, and Tailwind CSS v4.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:5001`

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at [http://localhost:3001](http://localhost:3001)

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
real-estate-frontend/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── globals.css        # Global styles
├── components/            # React components
│   └── providers/         # Context providers
├── lib/                   # Utility functions
│   ├── api.ts            # Axios instance
│   ├── utils.ts          # General utilities
│   └── formatters.ts     # Formatting functions
├── types/                 # TypeScript types
│   └── index.ts          # Common types
├── hooks/                 # Custom React hooks
└── public/               # Static assets
```

## Features

- 🏠 Property listings with advanced search
- 📍 Location-based filtering
- 💰 Price range filters
- 🔍 Advanced search with multiple criteria
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS v4
- 🔔 Real-time notifications
- 🤝 Referral system integration
- 📧 Email alerts for saved searches
- ❤️ Wishlist functionality

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
```

## API Integration

The frontend connects to the backend API at `http://localhost:5001/api/v1`. All API calls are made through the configured Axios instance in `lib/api.ts`.

## Development

- Port: 3001 (to avoid conflict with admin panel on 3000)
- Hot reload enabled
- TypeScript strict mode
- ESLint configured

## License

Private
