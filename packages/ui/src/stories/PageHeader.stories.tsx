import type { Meta, StoryObj } from '@storybook/react'
import { PageHeader } from '../components/PageHeader'

const meta: Meta<typeof PageHeader> = {
  title:     'UI / PageHeader',
  component: PageHeader,
  tags:      ['autodocs'],
  argTypes: {
    title:    { control: 'text', description: 'Primary heading text' },
    subtitle: { control: 'text', description: 'Optional secondary line below the title' },
  },
}

export default meta
type Story = StoryObj<typeof PageHeader>

export const Default: Story = {
  args: { title: 'Campaigns' },
}

export const WithSubtitle: Story = {
  args: {
    title:    'Analytics',
    subtitle: 'Last 30 days across all websites',
  },
}

export const LongTitle: Story = {
  args: {
    title:    'Organisation-wide Campaign Performance Report',
    subtitle: 'Rolling 90-day window · All regions · All channels',
  },
}
