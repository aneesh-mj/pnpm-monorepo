import type { Meta, StoryObj } from '@storybook/react'
import { ErrorPane } from '../components/ErrorPane'

const meta: Meta<typeof ErrorPane> = {
  title:     'UI / ErrorPane',
  component: ErrorPane,
  tags:      ['autodocs'],
  argTypes: {
    message: { control: 'text', description: 'Error message shown inside the alert' },
  },
}

export default meta
type Story = StoryObj<typeof ErrorPane>

export const Default: Story = {}

export const CustomMessage: Story = {
  args: { message: 'Failed to load campaigns. Check your connection and try again.' },
}

export const ShortMessage: Story = {
  args: { message: 'Not found.' },
}
