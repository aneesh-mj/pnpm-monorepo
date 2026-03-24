import React from 'react'
import { List, Datagrid, TextField, FunctionField } from 'react-admin'
import { StatusBadge } from '@myorg/ui'
import type { Campaign } from '@myorg/types'

export function CampaignsList() {
  return (
    <List>
      <Datagrid rowClick="edit">
        <TextField   source="id"        />
        <TextField   source="name"      />
        <TextField   source="websiteId" label="Website"  />
        <FunctionField
          label="Status"
          render={(record: Campaign) => <StatusBadge status={record.status} />}
        />
        <TextField   source="createdAt" label="Created"  />
      </Datagrid>
    </List>
  )
}
