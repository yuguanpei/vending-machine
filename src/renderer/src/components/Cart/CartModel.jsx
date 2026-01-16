import React from 'react'
import CartItem from '@/components/Cart/CartItem'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import useAppStore from '@/stores/appStore'
import useCart from '@/hooks/useCart'
import useCountdown from '@/hooks/useCountdown'
import useOrder from '@/hooks/useOrder'
import useSound from 'use-sound'
import popDown from '../../static/sounds/pop-down.mp3'
import poof from '../../static/sounds/poof.mp3'
import ding from '../../static/sounds/ding.mp3'

const CartModal = () => {
  const { cart, isCartModalOpen, closeCartModal } = useAppStore()
  const { totalPrice, clearCart } = useCart()
  const { createOrder } = useOrder()
  const [playPopDown] = useSound(popDown)
  const [playPoof] = useSound(poof)
  const [playDing] = useSound(ding)

  const TIMEOUT_SECONDS = 60
  const resetTimer = useCountdown(isCartModalOpen, TIMEOUT_SECONDS, closeCartModal)

  const handleCloseCartModal = () => {
    playPopDown()
    closeCartModal()
  }

  const handleClearCart = () => {
    playPoof()
    clearCart()
  }

  const handleCreateOrder = () => {
    playDing()
    closeCartModal()
    createOrder(cart, 'cart')
  }

  return (
    <Dialog open={isCartModalOpen} onOpenChange={handleCloseCartModal}>
      <DialogContent
        className="sm:max-w-[625px]"
        onInteractOutside={(e) => {
          e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault()
        }}
        onClick={() => resetTimer()}
      >
        <DialogHeader>
          <DialogTitle>购物车</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center py-8">购物车为空</p>
          ) : (
            cart.map((product) => <CartItem key={product.id} product={product} />)
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">总计: ¥{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1" onClick={handleClearCart}>
                清空购物车
              </Button>
              <Button className="flex-1" onClick={handleCreateOrder}>
                结算
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CartModal
