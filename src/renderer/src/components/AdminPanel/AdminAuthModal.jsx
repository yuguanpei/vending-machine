import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import useAppStore from '@/stores/appStore'
import useCountdown from '@/hooks/useCountdown'
import NumericKeypad from '@/components/Common/NumericKeypad'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import useSound from 'use-sound'
import popDown from '../../static/sounds/pop-down.mp3'
import error from '../../static/sounds/error.mp3'
import success from '../../static/sounds/success.mp3'

const AdminAuthModal = ({ isOpen }) => {
  const {
    password: authPassword,
    closeAdminAuthModal,
    isAdminAuthModalOpen,
    openAdminPanel
  } = useAppStore()
  const [password, setPassword] = useState('')
  const [playPopDown] = useSound(popDown)
  const [playError] = useSound(error)
  const [playSuccess] = useSound(success)

  const TIMEOUT_SECONDS = 10
  const { remaining, resetTimer } = useCountdown(
    TIMEOUT_SECONDS,
    closeAdminAuthModal,
    isAdminAuthModalOpen
  )

  const handleInput = (value) => {
    if (password.length < 6) {
      setPassword(password + value)
    }
  }

  const handleDelete = () => {
    setPassword(password.slice(0, -1))
  }

  const handleVerify = () => {
    if (password === authPassword) {
      playSuccess()
      openAdminPanel()
    } else {
      playError()
      setPassword('')
      toast.error('验证失败')
    }
  }

  const handleCloseAdminAuthModal = () => {
    setPassword('')
    playPopDown()
    closeAdminAuthModal()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseAdminAuthModal}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => {
          e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault()
        }}
        onClick={() => resetTimer()}
      >
        <DialogHeader>
          <DialogTitle>管理员认证</DialogTitle>
        </DialogHeader>

        <div className="mt-6 mb-6">
          <div className="flex justify-center gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center justify-center w-12 h-14 border-2 rounded-md text-xl font-semibold',
                  password[index]
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-muted-foreground/30 bg-muted/30 text-muted-foreground'
                )}
              >
                {password[index] ? '•' : ''}
              </div>
            ))}
          </div>
        </div>

        {/* 数字键盘 */}
        <NumericKeypad onInput={handleInput} onDelete={handleDelete} />

        {/* 验证按钮 */}
        <Button onClick={handleVerify} disabled={password.length != 6} className="w-full mt-4">
          验证
        </Button>
      </DialogContent>
    </Dialog>
  )
}

export default AdminAuthModal
