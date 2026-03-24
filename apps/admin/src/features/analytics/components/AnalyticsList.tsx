import React from 'react'
import { List, Datagrid, TextField, NumberField } from 'react-admin'

export function AnalyticsList() {
  return (
    <List>
      <Datagrid>
        <TextField   source="websiteId"   label="Website"     />
        <NumberField source="visits"      label="Total visits" />
        <NumberField source="conversions" label="Conversions"  />
      </Datagrid>
    </List>
  )
}
