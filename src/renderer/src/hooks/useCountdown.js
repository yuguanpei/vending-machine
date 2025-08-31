import { useState, useEffect, useRef, useCallback } from 'react'

const useCountdown = (timeoutSeconds, onTimeout, isActive) => {
  // countdown state + refs
  const [remaining, setRemaining] = useState(timeoutSeconds)
  const lastActivityRef = useRef(Date.now())
  const intervalRef = useRef(null)

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now()
    setRemaining(timeoutSeconds)
  }, [timeoutSeconds])

  useEffect(() => {
    // start / stop interval when modal open state changes
    if (!isActive) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      setRemaining(timeoutSeconds)
      return
    }

    // ensure fresh start
    resetTimer()
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActivityRef.current) / 1000)
      const rem = Math.max(0, timeoutSeconds - elapsed)
      setRemaining(rem)

      if (rem <= 0) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        onTimeout()
      }
    }, 500)

    return () => {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [isActive])

  return { remaining, resetTimer }
}

export default useCountdown
