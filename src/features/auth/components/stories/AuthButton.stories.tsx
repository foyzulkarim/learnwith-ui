import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import AuthButton from '../AuthButton';

const meta = {
  title: 'Features/Auth/AuthButton',
  component: AuthButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    onClick: action('onClick'),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AuthButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GoogleButton: Story = {
  args: {
    provider: 'google',
    isLoading: false,
  },
};

export const GoogleLoading: Story = {
  args: {
    provider: 'google',
    isLoading: true,
  },
};

export const GithubButton: Story = {
  args: {
    provider: 'github',
    isLoading: false,
  },
};

export const GithubLoading: Story = {
  args: {
    provider: 'github',
    isLoading: true,
  },
};