# Data Access in LearnFlow

This document explains how data access works in the LearnFlow application, particularly focusing on how to run the production build locally with reliable data.

## Problem: API Mocking Issues in Production

When running the production build on Cloudflare or similar environments, the mock API implementation might not work properly, causing data not to load correctly.

## Solution: Direct Mock Data Usage

Instead of relying on mocked API calls, we've simplified the application to use mock data directly. This ensures that data is always available, even in production builds.

### How It Works

The application now uses the following simplified approach:

1. **Direct Data Access**: We import and use mock data directly from the source files.
2. **No API Conditionals**: Instead of switching between API and mock data, we always use mock data.
3. **Visual Indicator**: A green indicator showing "📊 MOCK DATA" appears at the bottom right of the screen to indicate we're using mock data.

## How to Run Locally in Production Mode

To run the production build locally with reliable data access:

1. Build the application:
   ```bash
   npm run build
   ```

2. Preview the built application:
   ```bash
   npm run preview
   ```

3. Open the application in your browser (typically at http://localhost:4173).

The application will automatically display the mock data without requiring any API calls or complex configuration.

## Components Structure

The direct data access system consists of the following components:

1. `src/lib/mockData.ts` - Contains all the mock data definitions.
2. `src/lib/directData.ts` - Exports functions that directly access the mock data.
3. `src/components/DataTestComponent.tsx` - A simple component that directly renders mock data.
