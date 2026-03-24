import React from 'react'
import { List, Datagrid, TextField, EmailField } from 'react-admin'

export function UserList() {
  return (
    <List>
      <Datagrid rowClick="edit">
        <TextField  source="id"    />
        <TextField  source="name"  />
        <EmailField source="email" />
      </Datagrid>
    </List>
  )
}
