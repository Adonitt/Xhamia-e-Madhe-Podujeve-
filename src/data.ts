/** Publish only dates and details confirmed by the mosque. */
export type LocalizedText = { sq: string; en: string }

export type MosqueEvent = {
  id: string
  date: string // YYYY-MM-DD, Kosovo local date
  time: string // HH:mm, Kosovo local time
  title: LocalizedText
  description: LocalizedText
  contact: string
}

export type MosqueNotice = {
  id: string
  date: string // YYYY-MM-DD, Kosovo local date
  title: LocalizedText
  body: LocalizedText
}

export const events: MosqueEvent[] = []
export const notices: MosqueNotice[] = []
