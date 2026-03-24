import React from 'react'
import { Box, CircularProgress } from '@mui/material'

export function LoadingPane() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
      <CircularProgress />
    </Box>
  )
}
