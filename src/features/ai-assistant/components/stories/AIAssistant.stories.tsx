import type { Meta, StoryObj } from '@storybook/react';
import AIAssistant from '../AIAssistant';

const meta = {
  title: 'Features/AI Assistant/AIAssistant',
  component: AIAssistant,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    lessonTitle: { control: 'text' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof AIAssistant>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithLessonContext: Story = {
  args: {
    lessonTitle: 'Introduction to React Hooks',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};