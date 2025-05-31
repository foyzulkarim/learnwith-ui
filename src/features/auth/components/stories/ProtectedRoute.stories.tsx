import type { Meta, StoryObj } from '@storybook/react';
import { ProtectedRoute } from '../ProtectedRoute';
import { AuthProvider } from '../../context/AuthContext';

// Mock component to render inside ProtectedRoute
const ProtectedContent = () => (
  <div className="p-4 bg-white rounded-lg shadow">
    <h2 className="text-xl font-bold mb-2">Protected Content</h2>
    <p>This content is only visible to authenticated users.</p>
  </div>
);

const meta = {
  title: 'Features/Auth/ProtectedRoute',
  component: ProtectedRoute,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <AuthProvider>
        <div style={{ width: '400px' }}>
          <Story />
        </div>
      </AuthProvider>
    ),
  ],
} satisfies Meta<typeof ProtectedRoute>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: {
    path: '/protected',
    children: <ProtectedContent />,
  },
  parameters: {
    mockData: {
      auth: {
        isLoading: true,
        isLoggedIn: false,
      },
    },
  },
};

export const Authenticated: Story = {
  args: {
    path: '/protected',
    children: <ProtectedContent />,
  },
  parameters: {
    mockData: {
      auth: {
        isLoading: false,
        isLoggedIn: true,
      },
    },
  },
};

export const Unauthenticated: Story = {
  args: {
    path: '/protected',
    children: <ProtectedContent />,
  },
  parameters: {
    mockData: {
      auth: {
        isLoading: false,
        isLoggedIn: false,
      },
    },
  },
};