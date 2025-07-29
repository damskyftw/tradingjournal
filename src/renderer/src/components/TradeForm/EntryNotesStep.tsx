import { useState } from 'react'
import { UseFormReturn, useFieldArray } from 'react-hook-form'
import { Trade, TradeNote } from '../../../../shared/types'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Plus, Trash2, Clock } from 'lucide-react'
import { format } from 'date-fns'

interface EntryNotesStepProps {
  form: UseFormReturn<Trade>
}

export function EntryNotesStep({ form }: EntryNotesStepProps) {
  const { control, register, watch } = form
  const [newNote, setNewNote] = useState('')
  const [newNotePrice, setNewNotePrice] = useState('')
  const [newNoteTags, setNewNoteTags] = useState('')

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'duringTradeNotes',
  })

  const addNote = () => {
    if (!newNote.trim()) return

    const note: TradeNote = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      content: newNote.trim(),
      priceAtTime: newNotePrice ? parseFloat(newNotePrice) : undefined,
      tags: newNoteTags ? newNoteTags.split(',').map(tag => tag.trim()) : [],
      createdAt: new Date().toISOString(),
    }

    append(note)
    setNewNote('')
    setNewNotePrice('')
    setNewNoteTags('')
  }

  const formatTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), 'MMM dd, yyyy HH:mm')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Entry Notes</h2>
        <p className="text-slate-600 mb-6">
          Document your observations and thoughts during the trade. Add notes as the trade develops.
        </p>
      </div>

      {/* Add New Note */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New Note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newNote">
              Note Content
            </Label>
            <Textarea
              id="newNote"
              placeholder="What's happening with this trade? Market conditions, price action, sentiment, etc."
              rows={3}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newNotePrice">
                Price at Time (optional)
              </Label>
              <Input
                id="newNotePrice"
                type="number"
                step="0.01"
                placeholder="Current price"
                value={newNotePrice}
                onChange={(e) => setNewNotePrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newNoteTags">
                Tags (optional)
              </Label>
              <Input
                id="newNoteTags"
                placeholder="breakout, volume, news"
                value={newNoteTags}
                onChange={(e) => setNewNoteTags(e.target.value)}
              />
            </div>
          </div>

          <Button 
            type="button" 
            onClick={addNote}
            disabled={!newNote.trim()}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </CardContent>
      </Card>

      {/* Existing Notes */}
      {fields.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-900">Trade Timeline</h3>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <Card key={field.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        <Clock className="h-4 w-4" />
                        <span>{formatTimestamp(field.timestamp)}</span>
                        {field.priceAtTime && (
                          <span className="bg-slate-100 px-2 py-1 rounded text-xs">
                            ${field.priceAtTime.toFixed(2)}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-slate-900 mb-2">{field.content}</p>
                      
                      {field.tags && field.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {field.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {fields.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No entry notes yet</h3>
            <p className="text-slate-600 mb-4">
              Add notes as your trade develops to track your thinking and market observations.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-900 mb-2">📝 Entry Notes Tips</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Document key price levels and market reactions</li>
          <li>• Note any changes to your original thesis</li>
          <li>• Record emotional state and decision-making process</li>
          <li>• Track volume, momentum, and other technical indicators</li>
          <li>• Include relevant news or catalysts that develop</li>
        </ul>
      </div>
    </div>
  )
}