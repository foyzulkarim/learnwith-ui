import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import ChatInput from '../ChatInput';

const meta = {
  title: 'Features/AI Assistant/ChatInput',
  component: ChatInput,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    onSendMessage: action('onSendMessage'),
  },
} satisfies Meta<typeof ChatInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};