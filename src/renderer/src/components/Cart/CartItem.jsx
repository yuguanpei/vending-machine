import React, { useState, useCallback, memo } from 'react'
import { Button } from '@/components/ui/button'
import useCart from '@/hooks/useCart'
import { toast } from 'sonner'

const CartItem = ({ product }) => {
  const { addToCart, removeFromCart } = useCart()

  const handleAddToCart = (product) => {
    const result = addToCart(product)
    if (!result.success) {
      toast.warning(result.message)
    }
  }

  return (
    <div className="flex items-center space-x-4 p-2 bg-gray-50 rounded-md">
      <img src={product.src} alt={product.name} className="w-16 h-16 object-contain rounded-md" />
      <div className="flex-1">
        <h3 className="font-semibold truncate">{product.name}</h3>
        <p className="text-green-600">¥{product.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => removeFromCart(product)}
          className="w-8 h-8 p-0"
        >
          -
        </Button>
        <span className="w-8 text-center">{product.quantity}</span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleAddToCart(product)}
          className="w-8 h-8 p-0"
        >
          +
        </Button>
      </div>
    </div>
  )
}

export default CartItem
