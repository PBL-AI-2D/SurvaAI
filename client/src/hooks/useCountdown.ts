import { useEffect, useState } from 'react'

export const useCountdown = (initial: number) => {
  const [seconds, setSeconds] = useState(initial)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    if (seconds > 0) {
      const timer = setInterval(() => setSeconds((s) => s - 1), 1000)
      return () => clearInterval(timer)
    } else {
      setCanResend(true)
    }
  }, [seconds])

  const reset = () => {
    setSeconds(initial)
    setCanResend(false)
  }

  return { seconds, canResend, reset }
}
