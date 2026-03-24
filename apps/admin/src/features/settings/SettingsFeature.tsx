import React from 'react'
import { Resource } from 'react-admin'
import { SettingsList } from './components/SettingsList'

export default function SettingsFeature() {
  return <Resource name="settings" list={SettingsList} />
}
