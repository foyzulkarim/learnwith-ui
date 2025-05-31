import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CourseGrid from '../CourseGrid';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const meta = {
  title: 'Features/Course/CourseGrid',
  component: CourseGrid,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof CourseGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockCourses = [
  {
    _id: '1',
    title: 'Complete React Developer Course',
    thumbnailUrl: 'https://assets.foyzul.com/images/courses/react.jpg',
    instructor: 'John Doe',
    instructorAvatar: 'https://assets.foyzul.com/images/avatars/john.jpg',
    categoryId: 1,
    price: '49.99',
    rating: '4.8',
    isNew: true,
    bestseller: false,
    totalLessons: 20,
  },
  {
    _id: '2',
    title: 'Advanced JavaScript Concepts',
    thumbnailUrl: 'https://assets.foyzul.com/images/courses/javascript.jpg',
    instructor: 'Jane Smith',
    instructorAvatar: 'https://assets.foyzul.com/images/avatars/jane.jpg',
    categoryId: 1,
    price: '59.99',
    rating: '4.9',
    isNew: false,
    bestseller: true,
    totalLessons: 25,
  },
  {
    _id: '3',
    title: 'Node.js for Beginners',
    thumbnailUrl: 'https://assets.foyzul.com/images/courses/nodejs.jpg',
    instructor: 'Mike Johnson',
    instructorAvatar: 'https://assets.foyzul.com/images/avatars/mike.jpg',
    categoryId: 2,
    price: '39.99',
    rating: '4.7',
    isNew: false,
    bestseller: false,
    totalLessons: 15,
  },
  {
    _id: '4',
    title: 'Python Data Science',
    thumbnailUrl: 'https://assets.foyzul.com/images/courses/python.jpg',
    instructor: 'Sarah Wilson',
    instructorAvatar: 'https://assets.foyzul.com/images/avatars/sarah.jpg',
    categoryId: 3,
    price: '69.99',
    rating: '4.9',
    isNew: true,
    bestseller: true,
    totalLessons: 30,
  },
];

export const Loading: Story = {
  args: {
    title: 'All Courses',
    subtitle: 'Browse our latest courses',
  },
  parameters: {
    msw: {
      handlers: [
        rest.get('/api/courses', (_, res, ctx) => {
          return res(ctx.delay(infinite()));
        }),
      ],
    },
  },
};

export const WithCourses: Story = {
  args: {
    title: 'All Courses',
    subtitle: 'Browse our latest courses',
  },
  parameters: {
    msw: {
      handlers: [
        rest.get('/api/courses', (_, res, ctx) => {
          return res(ctx.json({
            courses: mockCourses,
            total: mockCourses.length,
            page: 1,
            limit: 8,
          }));
        }),
      ],
    },
  },
};

export const InProgressCourses: Story = {
  args: {
    title: 'Continue Learning',
    subtitle: 'Pick up where you left off',
    inProgress: true,
    viewAllLink: '/courses?filter=in-progress',
    viewAllText: 'View all my courses',
    limit: 4,
  },
  parameters: {
    msw: {
      handlers: [
        rest.get('/api/courses/in-progress', (_, res, ctx) => {
          return res(ctx.json({
            courses: mockCourses.map(course => ({
              ...course,
              progress: Math.floor(Math.random() * 100),
              completedLessons: Math.floor(Math.random() * course.totalLessons),
            })),
            total: mockCourses.length,
            page: 1,
            limit: 4,
          }));
        }),
      ],
    },
  },
};

export const WithCategory: Story = {
  args: {
    title: 'Web Development Courses',
    subtitle: 'Learn modern web development',
    categoryId: 1,
  },
  parameters: {
    msw: {
      handlers: [
        rest.get('/api/courses', (_, res, ctx) => {
          return res(ctx.json({
            courses: mockCourses.filter(course => course.categoryId === 1),
            total: mockCourses.filter(course => course.categoryId === 1).length,
            page: 1,
            limit: 8,
          }));
        }),
      ],
    },
  },
};