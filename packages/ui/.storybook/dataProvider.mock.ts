import type { DataProvider } from 'react-admin'

// Lightweight stub — returns empty data so AdminContext-wrapped stories
// render without needing a real API or MSW browser worker.
export const dataProvider: DataProvider = {
  getList:          async () => ({ data: [], total: 0 }),
  getOne:           async (_r, { id }) => ({ data: { id } }),
  getMany:          async () => ({ data: [] }),
  getManyReference: async () => ({ data: [], total: 0 }),
  create:           async (_r, { data }) => ({ data: { ...data, id: 'new' } }),
  update:           async (_r, { data }) => ({ data }),
  updateMany:       async () => ({ data: [] }),
  delete:           async (_r, { id }) => ({ data: { id } }),
  deleteMany:       async () => ({ data: [] }),
}
