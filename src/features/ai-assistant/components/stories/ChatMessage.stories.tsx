import type { Meta, StoryObj } from '@storybook/react';
import ChatMessage from '../ChatMessage';

const meta = {
  title: 'Features/AI Assistant/ChatMessage',
  component: ChatMessage,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ChatMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UserMessage: Story = {
  args: {
    message: {
      id: '1',
      content: 'Can you explain how React hooks work?',
      sender: 'user',
      timestamp: new Date(),
    },
  },
};

export const AIMessage: Story = {
  args: {
    message: {
      id: '2',
      content: `React Hooks are functions that allow you to "hook into" React state and lifecycle features from function components. They let you use state and other React features without writing a class component.

Some commonly used hooks include:
- useState: for managing state
- useEffect: for handling side effects
- useContext: for consuming context
- useRef: for maintaining mutable references`,
      sender: 'ai',
      timestamp: new Date(),
    },
  },
};

export const ShortAIMessage: Story = {
  args: {
    message: {
      id: '3',
      content: 'I can help you understand React hooks. What specific aspect would you like to learn about?',
      sender: 'ai',
      timestamp: new Date(),
    },
  },
};