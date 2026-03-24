import React from 'react'
import { Resource } from 'react-admin'
import { AnalyticsList } from './components/AnalyticsList'

export default function AnalyticsFeature() {
  return <Resource name="analytics" list={AnalyticsList} />
}
