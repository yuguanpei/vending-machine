import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import useAppStore from '@/stores/appStore'
import useCountdown from '@/hooks/useCountdown'
import NumericKeypad from '@/components/Common/NumericKeypad'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Package } from 'lucide-react'
import useOrder from '@/hooks/useOrder'
import useSound from 'use-sound'
import popDown from '../../static/sounds/pop-down.mp3'
import error from '../../static/sounds/error.mp3'
import success from '../../static/sounds/success.mp3'
import ding from '../../static/sounds/ding.mp3'

const OrderQueryModel = () => {
  const {
    closeOrderQueryModal,
    isOrderQueryModalOpen,
    openPaymentModal,
    currentOrder,
    setCurrentOrder
  } = useAppStore()
  const { getOrders } = useOrder()
  const [numericKeyword, setNumericKeyword] = useState('')
  const [playPopDown] = useSound(popDown)
  const [playError] = useSound(error)
  const [playSuccess] = useSound(success)
  const [playDing] = useSound(ding)

  useEffect(() => {
    if (isOrderQueryModalOpen) {
      setCurrentOrder(null)
    }
  }, [isOrderQueryModalOpen])

  function handlecloseOrderQueryModal() {
    setNumericKeyword('')
    closeOrderQueryModal()
  }

  const TIMEOUT_SECONDS = 30
  const resetTimer = useCountdown(
    isOrderQueryModalOpen,
    TIMEOUT_SECONDS,
    handlecloseOrderQueryModal
  )

  const handleInput = (value) => {
    if (numericKeyword.length < 6) {
      setNumericKeyword(numericKeyword + value)
    }
  }

  const handleDelete = () => {
    setNumericKeyword(numericKeyword.slice(0, -1))
  }

  const handleQueryQuery = async () => {
    const orders = await getOrders()
    const order = orders.find((order) => order.id.endsWith(numericKeyword))
    if (!order) {
      playError()
      setNumericKeyword('')
      toast.error('订单不存在,请输入当日生成的订单号后六位')
    } else {
      playSuccess()
      setCurrentOrder(order)
    }
  }

  const handleBackToQuery = () => {
    playPopDown()
    setNumericKeyword('')
    setCurrentOrder(null)
  }

  const handleRestorOrder = () => {
    playDing()
    handlecloseOrderQueryModal()
    openPaymentModal(currentOrder)
  }

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('zh-CN')
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: '待支付', variant: 'default' },
      cancel: { text: '已取消', variant: 'secondary' },
      timeout: { text: '超时关闭', variant: 'destructive' },
      paid: { text: '已完成', variant: 'outline' },
      dispensed: { text: '已出货', variant: 'default' }
    }

    const config = statusConfig[status] || { text: '未知状态', variant: 'default' }
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  const canRestorOrder = (status) => {
    return status === 'pending' || status === 'cancel' || status === 'timeout'
  }

  return (
    <Dialog
      open={isOrderQueryModalOpen}
      onOpenChange={() => {
        handlecloseOrderQueryModal()
        playPopDown()
      }}
    >
      <DialogContent
        className="sm:max-w-md md:max-w-lg"
        onInteractOutside={(e) => {
          e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault()
        }}
        onClick={() => resetTimer()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            订单查询
          </DialogTitle>
        </DialogHeader>

        {!currentOrder ? (
          <>
            <div className="mt-6 mb-6">
              <div className="text-center mb-4">
                <p className="text-xl">请输入订单编号后六位数字</p>
                <p className="text-base text-muted-foreground mt-2">仅支持查询当日的订单</p>
              </div>
              <div className="flex justify-center gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Input
                    key={index}
                    value={numericKeyword[index] || ''}
                    readOnly
                    className="w-10 h-12 text-center mx-1"
                  />
                ))}
              </div>
            </div>

            {/* 数字键盘 */}
            <NumericKeypad onInput={handleInput} onDelete={handleDelete} />

            {/* 查询按钮 */}
            <Button
              onClick={handleQueryQuery}
              disabled={numericKeyword.length !== 6}
              className="flex-1"
            >
              查询
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      订单编号: {currentOrder.id.toUpperCase()}
                    </CardTitle>
                    <CardDescription>{formatDateTime(currentOrder.createdAt)}</CardDescription>
                  </div>
                  {getStatusBadge(currentOrder.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {currentOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="flex-1 truncate mr-2">{item.name}</span>
                      <span className="whitespace-nowrap">x{item.quantity}</span>
                      <span className="whitespace-nowrap ml-4">¥{item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">商品数量</span>
                  <span>{currentOrder.items.reduce((sum, item) => sum + item.quantity, 0)}件</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">订单金额</span>
                  <span className="font-semibold">¥{currentOrder.total.toFixed(2)}</span>
                </div>
                {currentOrder.dispenses && (
                  <>
                    <span className="text-sm text-muted-foreground ">出货结果</span>
                    <div className="space-y-2 mt-2">
                      {currentOrder.dispenses.map((dispense, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="flex-1 truncate mr-2">{dispense.slot}</span>
                          <span className="whitespace-nowrap">{dispense.message}</span>
                          <span className="whitespace-nowrap ml-4">
                            {dispense.success ? '成功' : '失败'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBackToQuery} className="flex-1">
                返回查询
              </Button>
              {canRestorOrder(currentOrder.status) && (
                <Button onClick={handleRestorOrder} className="flex-1">
                  恢复订单
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default OrderQueryModel
