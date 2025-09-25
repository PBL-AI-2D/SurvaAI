import { useRef, useEffect } from 'react'

export function useAutosave<T>(callback: (data: T) => void, delay = 1500) {
  const timeout = useRef<NodeJS.Timeout | null>(null)
  const isFirstRun = useRef(true)

  const save = (data: T) => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }

    if (timeout.current) clearTimeout(timeout.current)
    timeout.current = setTimeout(() => callback(data), delay)
  }

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current)
    }
  }, [])

  return save
}
