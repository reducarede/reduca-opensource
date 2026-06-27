import { create } from 'zustand'

export const useAppStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  activeFolder: 'inbox',
  setActiveFolder: (folder) => set({ activeFolder: folder, selectedEmail: null, searchQuery: '' }),
  selectedEmail: null,
  setSelectedEmail: (email) => set({ selectedEmail: email }),
  isComposeOpen: false,
  setComposeOpen: (open) => set({ isComposeOpen: open }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}))
