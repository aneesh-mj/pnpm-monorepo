import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Box } from '@mui/material'
import { LoadingPane } from '../components/LoadingPane'

const meta: Meta<typeof LoadingPane> = {
  title:     'UI / LoadingPane',
  component: LoadingPane,
  tags:      ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Full-width centred spinner used as the `<Suspense fallback>` for each feature chunk.',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof LoadingPane>

export const Default: Story = {}

export const InsideConstrainedContainer: Story = {
  name: 'Inside a constrained container',
  render: () => (
    <Box width={320} border="1px dashed #ccc">
      <LoadingPane />
    </Box>
  ),
}
