import axios from 'axios'

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

export const normalizeRecord = (record) => {
  if (!record || typeof record !== 'object') return record
  const normalized = { ...record, id: record._id?.toString?.() || record.id }
  for (const key of ['clientId', 'projectId', 'invoiceId', 'workspaceId']) {
    if (normalized[key]?._id) normalized[key] = normalizeRecord(normalized[key])
  }
  return normalized
}

export const normalizeRecords = (records = []) => records.map(normalizeRecord)
