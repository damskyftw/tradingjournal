import { useNavigate } from 'react-router-dom'
import { CryptoTradeForm } from '../components/CryptoTradeForm'
import type { Trade } from '../../../shared/types'

export function NewTrade() {
  const navigate = useNavigate()

  const handleSave = (trade: Trade) => {
    // Navigate to the trade detail page after successful save
    navigate(`/trades/${trade.id}`)
  }

  const handleCancel = () => {
    navigate('/trades')
  }

  return (
    <CryptoTradeForm 
      onSave={handleSave}
      onCancel={handleCancel}
    />
  )
}