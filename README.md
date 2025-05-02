# LearnFlow - Learning Management System

LearnFlow is a modern learning management system built with React, Express, and NeonDB. This application allows users to browse courses, view lessons, and creators to manage their educational content.

## Project Overview

- **Frontend**: React with TypeScript, styled with Tailwind CSS and Shadcn UI components
- **Backend**: Express.js server
- **Database**: PostgreSQL via NeonDB
- **State Management**: React Query (TanStack Query)
- **Routing**: Wouter

## Prerequisites

- Node.js (v18+ recommended)
- NPM or Yarn
- A NeonDB account (or any PostgreSQL database)

## Getting Started

Follow these steps to set up and run the LearnFlow project locally:

### 1. Clone the Repository

If you've downloaded the project already, navigate to the project directory:

```bash
cd /path/to/LearnFlow
```

### 2. Install Dependencies

Install all required dependencies:

```bash
npm install
```

### 3. Database Setup

This project uses NeonDB, a serverless PostgreSQL service. You'll need to:

1. **Create a NeonDB Account**:
   - Sign up at [Neon](https://neon.tech)
   - Create a new project
   - Create a new database
   - Get your connection string from the Neon dashboard

2. **Configure Environment Variables**:
   - Create or edit the `.env` file in the project root
   - Add your database connection string:

```
DATABASE_URL=postgres://username:password@hostname/database
```

### 4. Database Schema and Seed Data

After configuring your database connection:

1. **Push the Database Schema**:
   ```bash
   npm run db:push
   ```

2. **Seed the Database with Initial Data**:
   ```bash
   npm run db:seed
   ```

### 5. Running the Application

Start the development server:

```bash
npm run dev
```

The application should now be running at `http://localhost:3000` (or whatever port is specified in the console output).

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Run the production build
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Update the database schema
- `npm run db:seed` - Seed the database with initial data

## Project Structure

- `/client` - Frontend React application
  - `/src/components` - Reusable UI components
  - `/src/context` - React context providers
  - `/src/hooks` - Custom React hooks
  - `/src/lib` - Utility functions and configuration
  - `/src/pages` - Application pages
- `/server` - Express.js backend
- `/db` - Database configuration and seed scripts
- `/shared` - Shared code between frontend and backend

## Features

- User authentication (login/register)
- Course browsing and filtering
- Course player for viewing lessons
- Creator dashboard for course management
- AI assistant functionality for answering questions
- Profile management

## Building for Production

To create a production build:

```bash
npm run build
```

To run the production build:

```bash
npm run start
```

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Verify your connection string in the `.env` file
2. Check that your NeonDB project is active
3. Ensure your IP address is allowed in the NeonDB firewall settings

### Running on a Different Port

If port 3000 is already in use, the server will automatically try to use another port. Check the console output to see which port the application is running on.
