import type { Meta, StoryObj } from '@storybook/react';
import CourseCard from '../CourseCard';

const meta = {
  title: 'Features/Course/CourseCard',
  component: CourseCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '350px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CourseCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseArgs = {
  _id: '1',
  title: 'Complete React Developer Course',
  thumbnailUrl: 'https://assets.foyzul.com/images/courses/react.jpg',
  instructor: 'John Doe',
  instructorAvatar: 'https://assets.foyzul.com/images/avatars/john.jpg',
  category: 'Web Development',
  price: '49.99',
  rating: '4.8',
};

export const Default: Story = {
  args: {
    ...baseArgs,
  },
};

export const Bestseller: Story = {
  args: {
    ...baseArgs,
    isBestseller: true,
  },
};

export const New: Story = {
  args: {
    ...baseArgs,
    isNew: true,
  },
};

export const Featured: Story = {
  args: {
    ...baseArgs,
    isFeatured: true,
  },
};

export const InProgress: Story = {
  args: {
    ...baseArgs,
    isInProgress: true,
    progress: 45,
    completedLessons: 9,
    totalLessons: 20,
    remainingTime: '5h 30m',
  },
};

export const LongTitle: Story = {
  args: {
    ...baseArgs,
    title: 'Complete React Developer Course with Redux, Hooks, GraphQL and Advanced Patterns',
  },
};