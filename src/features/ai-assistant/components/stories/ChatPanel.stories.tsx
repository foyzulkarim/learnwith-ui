import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import ChatPanel from '../ChatPanel';

const meta = {
  title: 'Features/AI Assistant/ChatPanel',
  component: ChatPanel,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    onSendMessage: action('onSendMessage'),
  },
  decorators: [
    (Story) => (
      <div style={{ height: '600px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChatPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    messages: [],
  },
};

export const WithMessages: Story = {
  args: {
    messages: [
      {
        id: '1',
        content: 'Can you explain how React hooks work?',
        sender: 'user',
        timestamp: new Date(Date.now() - 5000),
      },
      {
        id: '2',
        content: `React Hooks are functions that allow you to "hook into" React state and lifecycle features from function components. They let you use state and other React features without writing a class component.

Some commonly used hooks include:
- useState: for managing state
- useEffect: for handling side effects
- useContext: for consuming context
- useRef: for maintaining mutable references`,
        sender: 'ai',
        timestamp: new Date(Date.now() - 3000),
      },
      {
        id: '3',
        content: 'Can you show me an example of useState?',
        sender: 'user',
        timestamp: new Date(),
      },
    ],
  },
};

export const AITyping: Story = {
  args: {
    messages: [
      {
        id: '1',
        content: 'Can you explain how React hooks work?',
        sender: 'user',
        timestamp: new Date(),
      },
    ],
    isTyping: true,
  },
};

export const Disabled: Story = {
  args: {
    messages: [
      {
        id: '1',
        content: 'Can you explain how React hooks work?',
        sender: 'user',
        timestamp: new Date(),
      },
    ],
    disabled: true,
  },
};