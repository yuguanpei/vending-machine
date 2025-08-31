import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { QRCodeSVG } from 'qrcode.react'
import useAppStore from '@/stores/appStore'
import useCart from '@/hooks/useCart'
import useOrder from '@/hooks/useOrder'
import useCountdown from '@/hooks/useCountdown'
import NumericKeypad from '@/components/Common/NumericKeypad'
import { toast } from 'sonner'
import { Cog, Package, MapPin, ListOrdered } from 'lucide-react'

const PaymentModal = () => {
  const { vid, base, isPaymentModalOpen, closePaymentModal, currentOrder } = useAppStore()
  const { clearCart } = useCart()
  const { updateOrder, verifyTotpCode, isDispensing, dispenseInfo } = useOrder()
  const [totpCode, setTotpCode] = useState('')
  const [qrCode, setQrCode] = useState('')

  const TIMEOUT_SECONDS = 3 * 60
  const onPaymentModalTimeout = () => {
    handleClosePaymentModal('timeout')
    if (currentOrder.type === 'cart') {
      clearCart()
    }
  }
  const { remaining, resetTimer } = useCountdown(
    TIMEOUT_SECONDS,
    onPaymentModalTimeout,
    isPaymentModalOpen
  )

  useEffect(() => {
    if (currentOrder && isPaymentModalOpen) {
      setTotpCode('')
      const params = new URLSearchParams()
      if (vid) params.set('vid', String(vid))
      if (currentOrder.token) params.set('token', currentOrder.token)
      console.log(`${base}?${params.toString()}`)
      setQrCode(`${base}?${params.toString()}`)
    } else {
      setTimeout(() => {
        setQrCode('')
      }, 1000)
    }
  }, [currentOrder, isPaymentModalOpen])

  const handleVerification = async () => {
    const result = await verifyTotpCode(totpCode)
    if (result.success) {
      toast.success('验证成功，出货中...')
      closePaymentModal()
    } else {
      setTotpCode('')
      toast.error(result.message)
    }
  }

  const handleInput = (value) => {
    if (totpCode.length < 6) {
      setTotpCode(totpCode + value)
    }
  }

  const handleDelete = () => {
    setTotpCode(totpCode.slice(0, -1))
  }

  const handleClosePaymentModal = async (status) => {
    await updateOrder({ ...currentOrder, status })
    closePaymentModal()
  }

  return (
    <>
      <AlertDialog open={isDispensing}>
        <AlertDialogContent className="min-w-[100%] min-h-[100%] bg-black/60 border-0 rounded-none shadow-none flex flex-col items-center justify-center p-8 gap-4">
          <div className="text-center text-white p-8">
            <div className="flex justify-center mb-6">
              <Cog className="text-blue-400 animate-spin w-16 h-16" />
            </div>

            <h2 className="text-2xl font-bold mb-8 animate-pulse">
              请稍候，正在为您准备{dispenseInfo?.index && `第 ${dispenseInfo.index} 个`}商品...
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="flex flex-col items-center p-4 bg-white/10 rounded-lg">
                <Cog className="text-blue-400 w-10 h-10 mb-3" />
                <h3 className="text-lg font-semibold">{dispenseInfo?.slot}</h3>
              </div>

              <div className="flex flex-col items-center p-4 bg-white/10 rounded-lg">
                <Package className="text-green-400 w-10 h-10 mb-3" />
                <h3 className="text-lg font-semibold">{dispenseInfo?.product?.name}</h3>
              </div>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isPaymentModalOpen} onOpenChange={() => handleClosePaymentModal('cancel')}>
        <DialogContent
          className="sm:max-w-[625px]"
          onInteractOutside={(e) => {
            e.preventDefault()
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault()
          }}
          // reset timer on any click inside modal
          onClick={() => resetTimer()}
        >
          <DialogHeader>
            <DialogTitle>结算</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col md:flex-row gap-6">
            {/* 二维码区域 */}
            <div className="md:w-1/2 flex flex-col items-center justify-center">
              <QRCodeSVG value={qrCode} size={200} />
              <p className="mt-4 text-sm text-gray-600">请使用手机扫描二维码支付</p>
              <p className="text-red-500 mt-4">
                {remaining}秒后自动关闭
                <br />
                点击此处重置时间
              </p>
            </div>

            {/* TOTP输入区域 */}
            <div className="md:w-1/2">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-4">验证码</label>
                <div className="flex justify-center">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Input
                      key={index}
                      value={totpCode[index] || ''}
                      readOnly
                      className="w-10 h-12 text-center mx-1"
                    />
                  ))}
                </div>
              </div>

              {/* 数字键盘 */}
              <NumericKeypad onInput={handleInput} onDelete={handleDelete} />

              {/* 验证按钮 */}
              <Button
                onClick={handleVerification}
                disabled={totpCode.length !== 6}
                className="w-full mt-4"
              >
                验证
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default PaymentModal
