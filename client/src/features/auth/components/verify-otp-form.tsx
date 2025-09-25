'use client'

import { useState } from 'react'
import { useCountdown } from '@/hooks/useCountdown'
import { formatTime } from '@/utils/timeFormat'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Button } from '@/components/ui/button'

interface VerifyOtpFormProps {
  email: string;
  onSubmit: (payload: { email: string; otp: string }) => void;
  onBack: () => void;
  onResend: () => Promise<void>;
  loading: boolean;
  loadingResend: boolean;
}

export function VerifyOtpForm({
  email,
  onSubmit,
  onBack,
  onResend,
  loading,
  loadingResend,
}: VerifyOtpFormProps) {
  const [otp, setOtp] = useState('')
  const {
    seconds: resendCountdown,
    canResend,
    reset: resetCountdown,
  } = useCountdown(60)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit({ email, otp })
  }

  const handleResend = async () => {
    if (!canResend) return
    await onResend()
    resetCountdown()
  }

  return (
    <>
      <header className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Verify OTP</h1>
        <p className="text-sm text-muted-foreground">
          A verification code has been sent to{' '}
          <span className="font-semibold underline">{email || 'your email'}</span>
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 items-center mt-4">
        <InputOTP
          value={otp}
          onChange={setOtp}
          maxLength={6}
          containerClassName="pt-2"
        >
          <InputOTPGroup>
            {[...Array(6)].map((_, index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className="bg-glass-bg border border-glass-border backdrop-blur-md text-foreground"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>

        <div className="flex justify-between w-full gap-4">
          <Button
            type="button"
            onClick={onBack}
            disabled={loading || loadingResend}
            variant="ghost"
            className="font-medium w-full max-w-[120px] text-sm "
          >
            Back
          </Button>

          <Button
            type="submit"
            disabled={loading}
            className="w-full max-w-[120px] font-semibold bg-secondary hover:bg-secondary/90"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </Button>
        </div>
      </form>

      <footer className="mt-6 text-center text-sm text-muted-foreground">
        <p className="mb-1">Didn’t receive the code?</p>
        {canResend ? (
          <button
            onClick={handleResend}
            className="cursor-pointer text-primary font-medium hover:underline disabled:opacity-50"
            disabled={loadingResend}
          >
            {loadingResend ? 'Resending...' : 'Resend OTP'}
          </button>
        ) : (
          <span className="font-medium">{formatTime(resendCountdown)}</span>
        )}
      </footer>
    </>
  )
}
