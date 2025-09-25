'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FormGroup } from '@/components/umum/form/form-group'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface EmailRegisterFormProps {
  onSubmit: (payload: { email: string }) => void
  loading: boolean
}

export function EmailRegisterForm({ onSubmit, loading }: EmailRegisterFormProps) {
  const [email, setEmail] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit({ email })
  }

  return (
    <>
      <header className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Create an Account</h1>
        <p className="text-sm text-muted-foreground">Enter your email to start registering</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormGroup label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={handleChange}
            placeholder="user@email.com"
            disabled={loading}
            className="bg-glass-bg text-foreground placeholder:text-foreground/60 border border-glass-border backdrop-blur-md"
          />
        </FormGroup>

        <div className="pt-4 flex justify-center">
          <Button
            type="submit"
            disabled={loading}
            className="w-full font-semibold bg-secondary hover:bg-secondary/90"
          >
            {loading ? 'Processing...' : 'Sign Up'}
          </Button>
        </div>
      </form>

      <footer className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          Already have an account?{' '}
          <Link
            href="/login"
            className="underline hover:text-primary font-medium"
          >
            Sign in here
          </Link>
        </p>
      </footer>
    </>
  )
}
