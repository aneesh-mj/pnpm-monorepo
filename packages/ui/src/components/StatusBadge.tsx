import React from 'react'
import { Chip } from '@mui/material'

type Status = 'active' | 'paused' | 'archived'

const colorMap: Record<Status, 'success' | 'warning' | 'default'> = {
  active:   'success',
  paused:   'warning',
  archived: 'default',
}

export function StatusBadge({ status }: { status: Status }) {
  return <Chip label={status} color={colorMap[status]} size="small" />
}
