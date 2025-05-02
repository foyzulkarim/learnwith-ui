# LearnFlow Client

This is the client application for LearnFlow.

## Running in Client-Only Mode

You can run the client application independently without the server, using mock API responses.

### For macOS/Linux:

```bash
npm run client
```

### For Windows:

```bash
npm run client:win
```

This will start the client application on port 3000 with mock API enabled by default.

## How Mock API Works

The mock API is automatically enabled when:

1. You run the application with `npm run client` or `npm run client:win`
2. The environment variable `VITE_USE_MOCK_API` is set to `true`
3. You add `?mock=true` to the URL

When the mock API is enabled, a yellow indicator will appear in the bottom-right corner of the screen.

You can toggle between mock and real API using the "Disable Mock" button that appears next to the indicator.

## Mock API Layer

The frontend includes a mock data layer that allows you to run and develop the React UI without needing the Express backend. The mock layer intercepts API calls and returns predefined mock data that mimics the expected API response structure.

### Available Mock Data

The mock API provides data for:

- Authentication (always returns authenticated)
- Categories
- Courses (with filtering by search term, category, and limit)
- In-progress courses
- Course modules
- Course lessons
- Quiz questions and answers
- Notes
- Creator dashboard

### How It Works

The mock API works by:

1. Intercepting outgoing fetch requests to `/api/*` endpoints
2. Matching the request URL pattern to determine the appropriate mock response
3. Returning the mock data in the same format as the real API would

This allows you to build and test UI components without requiring the backend to be running.

### Adding More Mock Data

To add more mock data or modify existing data, edit the `src/lib/mockData.ts` file.

### Implementation Details

The mock API layer consists of:

- `src/lib/mockData.ts` - Contains all the mock data objects
- `src/lib/mockApi.ts` - Handles request interception and routing
- `src/lib/queryClient.ts` - Modified to use mock API when enabled
- `src/lib/mockSetup.ts` - Sets up the mock API and visual indicators
- `src/main.tsx` - Initializes the mock API setup 
