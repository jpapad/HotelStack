import type { Meta, StoryObj } from '@storybook/react';

import { Card, CardContent, CardHeader, CardTitle } from './card';

const meta: Meta = {
  title: 'UI/Card',
};

export default meta;

type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card title</CardTitle>
      </CardHeader>
      <CardContent>Card content</CardContent>
    </Card>
  ),
};
