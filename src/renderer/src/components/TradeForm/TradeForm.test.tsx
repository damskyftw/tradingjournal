import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TradeForm } from './index'
import type { Trade } from '../../../../shared/types'

// Mock the stores
vi.mock('../../store', () => ({
  useTradeActions: () => ({
    saveTrade: vi.fn().mockResolvedValue('test-id'),
    loadTrade: vi.fn(),
  }),
  useUIStore: () => ({
    forms: {
      tradeForm: {
        currentStep: 0,
        isDirty: false,
      }
    },
    setTradeFormStep: vi.fn(),
    setTradeFormDirty: vi.fn(),
    setTradeFormSaved: vi.fn(),
  }),
}))

// Mock the API service
vi.mock('../../services/api', () => ({
  ApiService: {
    saveTrade: vi.fn().mockResolvedValue({ success: true, data: 'test-id' }),
  },
}))

const renderTradeForm = (props = {}) => {
  return render(
    <MemoryRouter>
      <TradeForm {...props} />
    </MemoryRouter>
  )
}

describe('TradeForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the form with all steps', () => {
    renderTradeForm()
    
    // Check if step indicator is present
    expect(screen.getByText('Basic Information')).toBeInTheDocument()
    expect(screen.getByText('Pre-Trade Analysis')).toBeInTheDocument()
    expect(screen.getByText('Entry Notes')).toBeInTheDocument()
    expect(screen.getByText('Exit Notes')).toBeInTheDocument()
  })

  it('starts on the basic information step', () => {
    renderTradeForm()
    
    // Should show basic info fields
    expect(screen.getByLabelText(/ticker/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/entry date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/trade type/i)).toBeInTheDocument()
  })

  it('allows navigation between steps', async () => {
    renderTradeForm()
    
    // Fill required fields in step 1
    fireEvent.change(screen.getByLabelText(/ticker/i), { target: { value: 'AAPL' } })
    fireEvent.change(screen.getByLabelText(/entry date/i), { target: { value: '2024-01-15' } })
    
    // Click next
    const nextButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(nextButton)
    
    await waitFor(() => {
      expect(screen.getByLabelText(/thesis/i)).toBeInTheDocument()
    })
  })

  it('prevents progression with invalid data', async () => {
    renderTradeForm()
    
    // Try to go next without filling required fields
    const nextButton = screen.getByRole('button', { name: /next/i })
    fireEvent.click(nextButton)
    
    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/ticker is required/i)).toBeInTheDocument()
    })
  })

  it('persists form data between steps', async () => {
    renderTradeForm()
    
    const tickerInput = screen.getByLabelText(/ticker/i)
    fireEvent.change(tickerInput, { target: { value: 'AAPL' } })
    
    // Fill other required fields and go to next step
    fireEvent.change(screen.getByLabelText(/entry date/i), { target: { value: '2024-01-15' } })
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    
    // Go back to first step
    await waitFor(() => {
      const backButton = screen.getByRole('button', { name: /back/i })
      fireEvent.click(backButton)
    })
    
    // Data should still be there
    await waitFor(() => {
      expect(screen.getByDisplayValue('AAPL')).toBeInTheDocument()
    })
  })

  it('triggers auto-save after changes', async () => {
    const mockSaveTrade = vi.fn().mockResolvedValue('test-id')
    vi.mocked(() => ({ saveTrade: mockSaveTrade }))
    
    renderTradeForm()
    
    const tickerInput = screen.getByLabelText(/ticker/i)
    fireEvent.change(tickerInput, { target: { value: 'AAPL' } })
    
    // Wait for debounced save
    await waitFor(() => {
      expect(mockSaveTrade).toHaveBeenCalled()
    }, { timeout: 6000 })
  })

  it('loads existing trade for editing', () => {
    const existingTrade: Partial<Trade> = {
      id: 'test-id',
      ticker: 'AAPL',
      type: 'long',
      entryDate: '2024-01-15T10:00:00.000Z',
    }
    
    renderTradeForm({ trade: existingTrade })
    
    expect(screen.getByDisplayValue('AAPL')).toBeInTheDocument()
    expect(screen.getByDisplayValue('long')).toBeInTheDocument()
  })

  it('shows save status', async () => {
    renderTradeForm()
    
    // Make a change
    fireEvent.change(screen.getByLabelText(/ticker/i), { target: { value: 'AAPL' } })
    
    // Should show unsaved changes indicator
    await waitFor(() => {
      expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument()
    })
  })
})

describe('TradeForm Steps', () => {
  it('renders BasicInfoStep with correct fields', () => {
    renderTradeForm()
    
    expect(screen.getByLabelText(/ticker/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/entry date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/trade type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/entry price/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument()
  })

  it('shows PreTradeStep on step 2', async () => {
    renderTradeForm()
    
    // Navigate to step 2
    fireEvent.change(screen.getByLabelText(/ticker/i), { target: { value: 'AAPL' } })
    fireEvent.change(screen.getByLabelText(/entry date/i), { target: { value: '2024-01-15' } })
    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    
    await waitFor(() => {
      expect(screen.getByLabelText(/thesis/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/risk assessment/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/target price/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/stop loss/i)).toBeInTheDocument()
    })
  })
})