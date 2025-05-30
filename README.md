# LMS AI Application

An advanced Learning Management System built with React, TypeScript, and Vite.

## Environment Configuration

This application requires environment variables to be explicitly configured. No fallback values are provided to ensure full control over the configuration.

### Setup Instructions

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Configure your environment variables:**
   Edit the `.env` file with your specific configuration:

   ```bash
   # API Configuration (Required)
   VITE_API_URL=http://localhost:4000  # For development
   # VITE_API_URL=https://your-production-api.com  # For production

   # Authentication Configuration
   VITE_BYPASS_AUTH=false

   # Development Configuration
   NODE_ENV=development
   ```

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | **Yes** | `http://localhost:4000` |
| `VITE_BYPASS_AUTH` | Bypass authentication (dev only) | No | `false` |
| `NODE_ENV` | Environment mode | No | `development` |

⚠️ **Important**: `VITE_API_URL` is required and must be set explicitly. The application will not work without it.

### Production Deployment

For production deployment, you must set these environment variables in your deployment platform:

```bash
VITE_API_URL=https://your-production-api.com
VITE_BYPASS_AUTH=false
NODE_ENV=production
```

### Development Setup

For local development:

```bash
cp .env.example .env
# Edit .env and set VITE_API_URL=http://localhost:4000
npm install
npm run dev
```

The application requires explicit environment configuration for:
- ✅ Better security (no default URLs exposed)
- ✅ Full control over API endpoints
- ✅ Clear configuration requirements
- ✅ Prevents accidental fallback usage

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Features

- 🎓 Course management
- 👥 User authentication
- 📺 Video streaming with HLS
- 📝 Interactive lessons
- 🤖 AI assistant integration
- 📱 Responsive design

## Tech Stack

- React 18
- TypeScript
- Vite
- TailwindCSS
- React Query
- React Router

## Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Builds the application for production
- `npm run preview` - Previews the production build locally
- `npm run check` - Runs TypeScript type checking
- `npm run lint` - Lints the codebase

## Project Structure

- `/src` - Source code
  - `/components` - React components
  - `/context` - React context providers
  - `/hooks` - Custom React hooks
  - `/lib` - Utility functions and configurations
  - `/pages` - Application pages 
