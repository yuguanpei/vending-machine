import { useEffect, useRef, useCallback } from 'react'

const useCountdown = (isActive, timeoutSeconds, onTimeout, onCountdown) => {
  const lastActivityRef = useRef(Date.now())
  const intervalRef = useRef(null)

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now()
    onCountdown && onCountdown(timeoutSeconds)
  }, [onCountdown, timeoutSeconds])

  useEffect(() => {
    // start / stop interval when modal open state changes
    if (!isActive) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      return
    }

    // ensure fresh start
    resetTimer()
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActivityRef.current) / 1000)
      const remaining = Math.max(0, timeoutSeconds - elapsed)

      if (remaining <= 0) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        onTimeout && onTimeout()
        return
      }

      onCountdown && onCountdown(remaining)
    }, 1000)

    return () => {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [isActive])

  return resetTimer
}

export default useCountdown
