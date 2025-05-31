import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProgressSection from '../ProgressSection';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta = {
  title: 'Features/Home/ProgressSection',
  component: ProgressSection,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ProgressSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        rest.get('/api/courses/has-in-progress', (_, res, ctx) => {
          return res(ctx.delay(infinite()));
        }),
      ],
    },
  },
};

export const WithCourses: Story = {
  parameters: {
    msw: {
      handlers: [
        rest.get('/api/courses/has-in-progress', (_, res, ctx) => {
          return res(ctx.json(true));
        }),
      ],
    },
  },
};

export const NoCourses: Story = {
  parameters: {
    msw: {
      handlers: [
        rest.get('/api/courses/has-in-progress', (_, res, ctx) => {
          return res(ctx.json(false));
        }),
      ],
    },
  },
};