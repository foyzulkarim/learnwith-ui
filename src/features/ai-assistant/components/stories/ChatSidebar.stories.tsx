import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import ChatSidebar from '../ChatSidebar';

const meta = {
  title: 'Features/AI Assistant/ChatSidebar',
  component: ChatSidebar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    onSelectTopic: action('onSelectTopic'),
    onNewChat: action('onNewChat'),
  },
  decorators: [
    (Story) => (
      <div style={{ height: '600px', width: '300px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    topics: [],
    activeTopic: null,
  },
};

export const WithTopics: Story = {
  args: {
    topics: [
      {
        id: '1',
        title: 'React Hooks Discussion',
      },
      {
        id: '2',
        title: 'Understanding useEffect',
      },
      {
        id: '3',
        title: 'State Management in React',
      },
    ],
    activeTopic: '2',
  },
};

export const Disabled: Story = {
  args: {
    topics: [
      {
        id: '1',
        title: 'React Hooks Discussion',
      },
      {
        id: '2',
        title: 'Understanding useEffect',
      },
    ],
    activeTopic: '1',
    disabled: true,
  },
};