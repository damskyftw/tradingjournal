import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PortfolioState {
  totalPortfolioValue: number
  availableCash: number
  portfolioHistory: Array<{
    date: string
    totalValue: number
    cashValue: number
  }>
  setTotalPortfolioValue: (value: number) => void
  setAvailableCash: (value: number) => void
  addPortfolioSnapshot: (totalValue: number, cashValue: number) => void
  calculatePositionSize: (percentage: number) => number
  calculateMaxPositionSize: (riskPercentage: number) => number
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      totalPortfolioValue: 100000, // Default $100k portfolio
      availableCash: 100000,
      portfolioHistory: [],

      setTotalPortfolioValue: (value: number) => 
        set({ totalPortfolioValue: value }),

      setAvailableCash: (value: number) => 
        set({ availableCash: value }),

      addPortfolioSnapshot: (totalValue: number, cashValue: number) => 
        set((state) => ({
          portfolioHistory: [
            ...state.portfolioHistory,
            {
              date: new Date().toISOString(),
              totalValue,
              cashValue,
            },
          ].slice(-365), // Keep last 365 snapshots
        })),

      calculatePositionSize: (percentage: number) => {
        const { totalPortfolioValue } = get()
        return (totalPortfolioValue * percentage) / 100
      },

      calculateMaxPositionSize: (riskPercentage: number = 2) => {
        const { totalPortfolioValue } = get()
        return (totalPortfolioValue * riskPercentage) / 100
      },
    }),
    {
      name: 'portfolio-storage',
    }
  )
)