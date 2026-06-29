import type { SavedRecord } from './types'

const STORAGE_KEY = 'dental-simulation-saves'

function readAll(): SavedRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(records: SavedRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function listSavedRecords(): SavedRecord[] {
  return readAll().sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  )
}

export function saveRecord(record: SavedRecord): void {
  const records = readAll()
  records.unshift(record)
  writeAll(records)
}

export function deleteSavedRecord(id: string): void {
  writeAll(readAll().filter((record) => record.id !== id))
}

export function formatSavedAt(isoDate: string): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate))
}
