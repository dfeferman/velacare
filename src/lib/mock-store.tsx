'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import { MOCK_PRODUKTE, MOCK_KUNDEN } from './mock-data'
import type { Produkt, MockKunde } from './types'

interface MockStoreState {
  produkte: Produkt[]
  kunden: MockKunde[]
  addProdukt: (p: Omit<Produkt, 'id'>) => void
  updateProdukt: (id: string, updates: Partial<Produkt>) => void
  deleteProdukt: (id: string) => void
  updateKunde: (id: string, updates: Partial<MockKunde>) => void
}

const MockStoreContext = createContext<MockStoreState | null>(null)

export function MockStoreProvider({ children }: { children: ReactNode }) {
  const [produkte, setProdukte] = useState<Produkt[]>(MOCK_PRODUKTE)
  const [kunden, setKunden] = useState<MockKunde[]>(MOCK_KUNDEN)

  const addProdukt = (p: Omit<Produkt, 'id'>) =>
    setProdukte(prev => [...prev, { ...p, id: `p${Date.now()}` }])

  const updateProdukt = (id: string, updates: Partial<Produkt>) =>
    setProdukte(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))

  const deleteProdukt = (id: string) =>
    setProdukte(prev => prev.filter(p => p.id !== id))

  const updateKunde = (id: string, updates: Partial<MockKunde>) =>
    setKunden(prev => prev.map(k => k.id === id ? { ...k, ...updates } : k))

  return (
    <MockStoreContext.Provider value={{ produkte, kunden, addProdukt, updateProdukt, deleteProdukt, updateKunde }}>
      {children}
    </MockStoreContext.Provider>
  )
}

export function useMockStore() {
  const ctx = useContext(MockStoreContext)
  if (!ctx) throw new Error('useMockStore must be used within MockStoreProvider')
  return ctx
}
