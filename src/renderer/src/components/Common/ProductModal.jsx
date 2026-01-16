import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import useAppStore from '@/stores/appStore'
import useCart from '@/hooks/useCart'
import useConfig from '@/hooks/useConfig'
import useOrder from '@/hooks/useOrder'
import useCountdown from '@/hooks/useCountdown'
import { toast } from 'sonner'
import useSound from 'use-sound'
import popDown from '../../static/sounds/pop-down.mp3'
import levelUp from '../../static/sounds/level-up.mp3'
import ding from '../../static/sounds/ding.mp3'

const ProductModal = () => {
  const { currentProduct, isProductModalOpen, closeProductModal } = useAppStore()
  const { addToCart } = useCart()
  const { createOrder } = useOrder()
  const { getProductStock } = useConfig()

  const [playPopDown] = useSound(popDown)
  const [playLevelUp] = useSound(levelUp)
  const [playDing] = useSound(ding)

  const TIMEOUT_SECONDS = 60
  const resetTimer = useCountdown(isProductModalOpen, TIMEOUT_SECONDS, closeProductModal)

  if (!currentProduct) return null

  currentProduct.stock = getProductStock(currentProduct.id)

  const handleAddToCart = () => {
    playLevelUp()
    const result = addToCart(currentProduct)
    if (!result.success) {
      toast.warning(result.message)
    } else {
      closeProductModal()
    }
  }

  const handleBuyNow = () => {
    playDing()
    closeProductModal()
    createOrder([{ ...currentProduct, quantity: 1 }], 'product')
  }

  const handleCloseProductModal = () => {
    playPopDown()
    closeProductModal()
  }

  return (
    <Dialog open={isProductModalOpen} onOpenChange={handleCloseProductModal}>
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
          <DialogTitle>商品详情</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-start md:flex-row gap-6">
          {/* 商品图片 */}
          <img
            src={currentProduct.src}
            alt={currentProduct.name}
            className="w-64 object-contain rounded-md"
          />

          {/* 商品信息 */}
          <div className="md:w-1/2 flex flex-col justify-between h-[100%]">
            <div>
              <div className="flex justify-between">
                <h2 className="text-2xl font-bold mb-2">{currentProduct.name}</h2>
                <p className="text-red-500 text-xl font-bold mb-2">
                  ¥{currentProduct.price.toFixed(2)}
                </p>
              </div>
              <p className="text-sm text-gray-500">库存: {currentProduct.stock}</p>
              <div
                className="mb-4 mt-4"
                dangerouslySetInnerHTML={{
                  __html: currentProduct.description
                }}
              />
            </div>

            {/* 操作按钮 */}
            <div className="flex space-x-2">
              <Button
                onClick={handleAddToCart}
                disabled={currentProduct.stock === 0}
                className="flex-1"
              >
                加入购物车
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={currentProduct.stock === 0}
                className="flex-1"
                variant="secondary"
              >
                立即购买
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ProductModal
