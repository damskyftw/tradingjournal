import { FileService } from './src/main/services/FileService.ts'
import { validateTrade } from './src/shared/types/index.ts'

const mockTrade = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  ticker: 'AAPL',
  entryDate: '2025-01-24T10:30:00.000Z',
  type: 'long',
  entryPrice: 185.5,
  quantity: 100,
  preTradeNotes: {
    thesis: 'Strong Q4 earnings expected with iPhone sales growth momentum continuing',
    riskAssessment: 'Low risk due to strong fundamentals and market position in AI',
    targetPrice: 200,
    stopLoss: 175,
    positionSize: 10000,
    timeframe: '2-3 weeks',
  },
  duringTradeNotes: [],
  screenshots: [],
  tags: [],
  createdAt: '2025-01-24T10:30:00.000Z',
  updatedAt: '2025-01-24T15:45:00.000Z',
}

async function test() {
  try {
    const validated = validateTrade(mockTrade)
    console.log('Validation passed:', validated.id)
    
    const fileService = new FileService('/tmp/test-trading')
    const result = await fileService.saveTrade(mockTrade)
    console.log('Save result:', result)
  } catch (error) {
    console.error('Error:', error)
  }
}

test()