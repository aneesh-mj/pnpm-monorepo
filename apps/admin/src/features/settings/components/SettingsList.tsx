import React from 'react'
import { List, Datagrid, TextField } from 'react-admin'

export function SettingsList() {
  return (
    <List>
      <Datagrid>
        <TextField source="websiteId" label="Website"  />
        <TextField source="timezone"  label="Timezone" />
        <TextField source="currency"  label="Currency" />
        <TextField source="locale"    label="Locale"   />
      </Datagrid>
    </List>
  )
}
