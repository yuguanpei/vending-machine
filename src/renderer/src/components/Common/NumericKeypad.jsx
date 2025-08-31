import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Delete, CheckCircle } from 'lucide-react'

const NumericKeypad = ({ onInput, onDelete, onConfirm }) => {
  const handleButtonClick = (value) => {
    if (onInput) {
      onInput(value)
    }
  }

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete()
    }
  }

  const handleConfirmClick = () => {
    if (onConfirm) {
      onConfirm()
    }
  }

  return (
    <Card className="bg-muted/50 border-0">
      <CardContent className="p-3">
        <div className="grid grid-cols-3 gap-2">
          {/* 数字键 1-9 */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <Button
              key={num}
              onClick={() => handleButtonClick(num.toString())}
              variant="outline"
              size="lg"
              className="h-14 text-lg font-semibold hover:bg-primary/10 active:bg-primary/20 transition-colors"
            >
              {num}
            </Button>
          ))}

          {/* 底部一行： 留空、0、删除 */}
          <div></div>

          <Button
            onClick={() => handleButtonClick('0')}
            variant="outline"
            size="lg"
            className="h-14 text-lg font-semibold hover:bg-primary/10 active:bg-primary/20 transition-colors"
          >
            0
          </Button>

          <Button
            onClick={handleDeleteClick}
            variant="destructive"
            size="lg"
            className="h-14 hover:bg-destructive/90 active:bg-destructive transition-colors"
          >
            <Delete className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default NumericKeypad
