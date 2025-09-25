'use client'

import { useEffect } from 'react'
import { useRegister } from '@/features/auth/hooks/useRegister'
import { EmailRegisterForm } from '@/features/auth/components/email-registration-form'
import { VerifyOtpForm } from '@/features/auth/components/verify-otp-form'
import { CompleteAccountForm } from '@/features/auth/components/complete-registration-form'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { RegisterForm } from '@/features/auth/hooks/useRegister'

export function RegisterPage() {
  const {
    step,
    email,
    setStep,
    clearError,
    errorMessage,
    emailRegister,
    resendOtp,
    verifyOtp,
    completeAccount,
  } = useRegister()

  const { login } = useAuth()

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage)
      clearError()
    }
  }, [errorMessage, clearError])

  const handleCompleteAccount = async (formData: RegisterForm) => {
    try {
      await completeAccount.mutateAsync(formData)
      toast.success('Account completed! Logging in...')

      await login({
        email,
        password: formData.password,
        remember_me: true,
      })
    } catch (error) {
      toast.error((error as Error)?.message || 'Failed to complete registration')
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen w-full md:px-10 px-5 py-16 text-foreground">
      <section
        className="w-full h-fit self-center border border-glass-border bg-glass-bg backdrop-blur-xl shadow-xl transition
        px-6 py-10 space-y-6 rounded-none rounded-bl-[70px] rounded-tr-[70px] bg-cover bg-[url('/images/auth-page/background.png')]"
        style={{
          maxWidth: step === 'complete' ? 600 : 450,
          background: 'var(--glass-background)',
          borderColor: 'var(--glass-border)',
          boxShadow: 'var(--glass-shadow)',
          backdropFilter: 'var(--glass-blur)',
        }}
      >
        {step === 'init' && (
          <EmailRegisterForm
            onSubmit={emailRegister.mutate}
            loading={emailRegister.isPending}
          />
        )}

        {step === 'verify' && (
          <VerifyOtpForm
            email={email}
            onSubmit={verifyOtp.mutate}
            onBack={() => setStep('init')}
            onResend={() => resendOtp.mutateAsync({ email })}
            loading={verifyOtp.isPending}
            loadingResend={resendOtp.isPending}
          />
        )}

        {step === 'complete' && (
          <CompleteAccountForm
            email={email}
            onSubmit={handleCompleteAccount}
            loading={completeAccount.isPending}
          />
        )}
      </section>
    </main>
  )
}
