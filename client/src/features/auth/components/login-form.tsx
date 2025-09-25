'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { FormGroup } from '@/components/umum/form/form-group';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/umum/form/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface LoginFormProps {
  onSubmit: (payload: { email: string; password: string; remember_me: boolean }) => void;
  loading: boolean;
}

export function LoginForm({ onSubmit, loading }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember_me: false,
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit(formData);
    },
    [formData, onSubmit]
  );

  return (
    <>
      <header className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Login to Your Account</h1>
        <p className="text-sm text-muted-foreground">Use your credentials to sign in</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormGroup label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="example@mail.com"
            className="bg-glass-bg text-foreground placeholder:text-foreground/60 border border-glass-border backdrop-blur-md"
            disabled={loading}
          />
        </FormGroup>

        <FormGroup label="Password" htmlFor="password">
          <PasswordInput
            id="password"
            name="password"
            required
            minLength={8}
            value={formData.password}
            onChange={handleChange}
            placeholder="Your password"
            disabled={loading}
          />
        </FormGroup>

        <div className="flex items-center gap-2">
          <Checkbox
            id="remember_me"
            name="remember_me"
            checked={formData.remember_me}
            onCheckedChange={(checked: boolean) =>
              setFormData((prev) => ({ ...prev, remember_me: checked }))
            }
            disabled={loading}
            className="bg-glass-bg text-foreground placeholder:text-foreground/60 border border-glass-border backdrop-blur-md"
          />
          <label
            htmlFor="remember_me"
            className="text-sm cursor-pointer text-foreground"
          >
            Remember Me
          </label>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full font-semibold bg-secondary hover:bg-secondary/90"
        >
          {loading ? 'Processing...' : 'Sign In'}
        </Button>
      </form>

      <footer className="mt-6 text-center text-sm text-muted-foreground">
        <p>
          Don’t have an account?{' '}
          <Link href="/register" className="underline hover:text-primary font-medium">
            Sign up here
          </Link>
        </p>
      </footer>
    </>
  );
}
