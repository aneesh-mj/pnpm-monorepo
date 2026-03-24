import React from 'react'
import { Box, Typography } from '@mui/material'

interface PageHeaderProps {
  title:     string
  subtitle?: string
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <Box mb={3}>
      <Typography variant="h5" fontWeight={500}>{title}</Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
      )}
    </Box>
  )
}
