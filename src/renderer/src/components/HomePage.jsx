import { useState, useEffect } from 'react'
import useAppStore from '@/stores/appStore'
import useConfig from '@/hooks/useConfig'
import CartModel from '@/components/Cart/CartModel'
import ProductModal from '@/components/Common/ProductModal'
import OrderQueryModel from '@/components/Common/OrderQueryModel'
import AdminAuthModal from '@/components/AdminPanel/AdminAuthModal'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InfoIcon } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import PaymentModal from '@/components/Common/PaymentModal'
import useCart from '@/hooks/useCart'
import useSound from 'use-sound'
import popUp from '../static/sounds/pop-up.mp3'

const HomePage = () => {
  const {
    password: authPassword,
    ads,
    products,
    openProductModal,
    openOrderQueryModal,
    isAdminAuthModalOpen,
    openAdminAuthModal,
    openAdminPanel,
    openCartModal
  } = useAppStore()
  const { totalItems } = useCart()

  const { loading } = useConfig()
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [clickCount, setClickCount] = useState(0)
  const [lastClickTime, setLastClickTime] = useState(0)
  const [playPopUp] = useSound(popUp)

  useEffect(() => {
    if (ads.length === 0) return

    let interval
    const currentAd = ads[currentAdIndex]

    if (currentAd.type === 'image') {
      // 图片广告使用duration字段作为停留时间
      interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length)
      }, currentAd.duration || 15000) // 默认15秒
      return () => clearInterval(interval)
    } else if (currentAd.type === 'video') {
      // 视频广告，监听视频结束事件
      const handleVideoEnd = () => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length)
      }
      const videoElement = document.getElementById(`ad-${currentAd.id}`)
      videoElement.addEventListener('ended', handleVideoEnd)
      return () => {
        videoElement.removeEventListener('ended', handleVideoEnd)
        clearInterval(interval)
      }
    } else {
      return () => clearInterval(interval)
    }
  }, [ads, currentAdIndex])

  const handleOpenProductModal = (product) => {
    playPopUp()
    openProductModal(product)
  }

  const handleOpenCartModal = () => {
    playPopUp()
    openCartModal()
  }

  const handleOpenOrderQueryModal = () => {
    playPopUp()
    openOrderQueryModal()
  }

  const handleCopyrightClick = () => {
    if (!authPassword) {
      playPopUp()
      openAdminPanel()
      return
    }

    const now = Date.now()

    // 如果两次点击间隔超过1秒，重置计数
    if (now - lastClickTime > 1000) {
      setClickCount(1)
      setLastClickTime(now)
      return
    }

    // 更新点击次数
    const newCount = clickCount + 1
    setClickCount(newCount)
    setLastClickTime(now)

    // 如果达到7次点击，打开modal并重置计数
    if (newCount >= 7) {
      playPopUp()
      openAdminAuthModal()
      setClickCount(0)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-background overflow-hidden">
        <Skeleton className="w-full h-[calc(100vw/16*9)]" />
        <div className="flex-1 p-12 overflow-auto">
          <ScrollArea className="h-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
              <Skeleton className="h-[300px] w-[215px] mb-6" />
              <Skeleton className="h-[300px] w-[215px] mb-6" />
              <Skeleton className="h-[300px] w-[215px] mb-6" />
              <Skeleton className="h-[300px] w-[215px] mb-6" />
              <Skeleton className="h-[300px] w-[215px] mb-6" />
              <Skeleton className="h-[300px] w-[215px] mb-6" />
              <Skeleton className="h-[300px] w-[215px] mb-6" />
              <Skeleton className="h-[300px] w-[215px] mb-6" />
              <Skeleton className="h-[300px] w-[215px] mb-6" />
              <Skeleton className="h-[300px] w-[215px] mb-6" />
              <Skeleton className="h-[300px] w-[215px] mb-6" />
              <Skeleton className="h-[300px] w-[215px] mb-6" />
              <Skeleton className="h-[300px] w-[215px] mb-6" />
              <Skeleton className="h-[300px] w-[215px] mb-6" />
              <Skeleton className="h-[300px] w-[215px] mb-6" />
              <Skeleton className="h-[300px] w-[215px] mb-6" />
            </div>
          </ScrollArea>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* 广告区域 */}
      <div className="w-full h-[calc(100vw/16*9)] bg-black flex items-center justify-center">
        {ads && ads.length > 0 ? (
          <div className="w-full">
            {ads[currentAdIndex].type === 'image' ? (
              <img
                id={`ad-${ads[currentAdIndex].id}`}
                src={ads[currentAdIndex].src}
                alt="广告"
                className="w-full object-contain"
                style={{ maxHeight: '60vh' }}
              />
            ) : (
              <video
                id={`ad-${ads[currentAdIndex].id}`}
                src={ads[currentAdIndex].src}
                autoPlay
                className="w-full object-contain"
                style={{ maxHeight: '60vh' }}
              />
            )}
          </div>
        ) : (
          <Alert className="w-auto m-4">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>暂无广告内容</AlertDescription>
          </Alert>
        )}
      </div>

      {/* 商品网格区域 */}
      <div className="flex-1 p-12 overflow-auto">
        {products.length > 0 ? (
          <ScrollArea className="h-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="h-[300px] w-[215px] mb-6 p-0"
                  onClick={() => handleOpenProductModal(product)}
                >
                  <CardContent className="p-3 flex flex-col justify-between">
                    <img src={product.src} alt={product.name} className="h-[85%] object-cover " />
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm line-clamp-1 flex-1 mr-2">
                        {product.name}
                      </span>
                      <span className="text-red-500 font-bold text-sm whitespace-nowrap">
                        ¥{product.price.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <Alert className="w-fit mx-auto mt-6">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>暂无商品</AlertDescription>
          </Alert>
        )}
      </div>

      {/* 左下区域 */}
      <div className="bottom-2 fixed flex px-4 w-full z-40">
        {/* 版权信息 */}
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground h-auto p-1"
          onClick={handleCopyrightClick}
        >
          © {new Date().getFullYear()} Vending Machine v1.0
        </Button>

        {/* 订单查询入口 */}
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-auto p-1 ml-2"
          onClick={handleOpenOrderQueryModal}
        >
          订单查询
        </Button>
      </div>

      {/* 管理员认证模态框 */}
      <AdminAuthModal isOpen={isAdminAuthModalOpen} />

      {products.length > 0 && (
        <>
          {/* 右下区域 */}
          <div className="bottom-4 fixed right-4 z-40">
            {/* 购物车入口 */}
            <Button
              onClick={handleOpenCartModal}
              size="lg"
              className="h-14 w-14 rounded-full relative"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-[24px!important] w-[24px!important]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>

          {/* 商品详情模态框 */}
          <ProductModal />

          {/* 购物车模态框 */}
          <CartModel />

          {/* 支付模态框 */}
          <PaymentModal />

          {/* 订单查询模态框 */}
          <OrderQueryModel />
        </>
      )}
    </div>
  )
}

export default HomePage
