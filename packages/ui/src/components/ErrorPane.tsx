import React from 'react'
import { Box, Alert } from '@mui/material'

interface ErrorPaneProps {
  message?: string
}

export function ErrorPane({ message = 'Something went wrong. Please try again.' }: ErrorPaneProps) {
  return (
    <Box p={3}>
      <Alert severity="error">{message}</Alert>
    </Box>
  )
}
