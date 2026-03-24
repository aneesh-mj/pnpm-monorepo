import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Stack } from '@mui/material'
import { StatusBadge } from '../components/StatusBadge'

const meta: Meta<typeof StatusBadge> = {
  title:     'UI / StatusBadge',
  component: StatusBadge,
  tags:      ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['active', 'paused', 'archived'],
      description: 'Campaign lifecycle state',
    },
  },
}

export default meta
type Story = StoryObj<typeof StatusBadge>

export const Active: Story = {
  args: { status: 'active' },
}

export const Paused: Story = {
  args: { status: 'paused' },
}

export const Archived: Story = {
  args: { status: 'archived' },
}

export const AllVariants: Story = {
  name: 'All variants',
  render: () => (
    <Stack direction="row" spacing={1}>
      <StatusBadge status="active"   />
      <StatusBadge status="paused"   />
      <StatusBadge status="archived" />
    </Stack>
  ),
}
