import { fetchUtils, DataProvider } from 'react-admin'
import { API_ROUTES } from '@myorg/types'

const apiUrl    = import.meta.env.VITE_API_URL ?? ''
const httpClient = fetchUtils.fetchJson

export const dataProvider: DataProvider = {
  getList: async (resource) => {
    const { json } = await httpClient(`${apiUrl}/api/${resource}`)
    return { data: json, total: json.length }
  },
  getOne: async (resource, { id }) => {
    const { json } = await httpClient(`${apiUrl}/api/${resource}/${id}`)
    return { data: json }
  },
  getMany:          async () => ({ data: [] }),
  getManyReference: async () => ({ data: [], total: 0 }),
  create: async (resource, { data }) => {
    const { json } = await httpClient(`${apiUrl}/api/${resource}`, {
      method: 'POST',
      body:   JSON.stringify(data),
    })
    return { data: json }
  },
  update: async (resource, { id, data }) => {
    const { json } = await httpClient(`${apiUrl}/api/${resource}/${id}`, {
      method: 'PUT',
      body:   JSON.stringify(data),
    })
    return { data: json }
  },
  updateMany: async () => ({ data: [] }),
  delete: async (resource, { id }) => {
    await httpClient(`${apiUrl}/api/${resource}/${id}`, { method: 'DELETE' })
    return { data: { id } as any }
  },
  deleteMany: async () => ({ data: [] }),
}
