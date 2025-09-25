'use client'

import { useState } from 'react'
import { PasswordInput } from '@/components/umum/form/password-input'
import { FormGroup } from '@/components/umum/form/form-group'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RegisterForm } from '../hooks/useRegister'

interface CompleteAccountFormProps {
  email: string;
  onSubmit: (formData: RegisterForm) => void;
  loading: boolean;
}

export function CompleteAccountForm({
  email,
  onSubmit,
  loading,
}: CompleteAccountFormProps) {
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    password: '',
    konfirmasi_password: '',
    jenis_kelamin: '',
    tanggal_lahir: '',
    region: '',
    status: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <>
      <header className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-foreground">Complete Your Profile</h2>
        <p className="text-sm text-muted-foreground">Please provide additional information</p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[600px] space-y-6 text-foreground"
      >
        <FormGroup label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            value={email}
            readOnly
            className="bg-glass-bg border border-glass-border text-foreground placeholder:text-muted-foreground backdrop-blur-md"
          />
        </FormGroup>

        <FormGroup label="Full Name" htmlFor="nama_lengkap">
          <Input
            id="nama_lengkap"
            name="nama_lengkap"
            type="text"
            value={formData.nama_lengkap}
            onChange={handleChange}
            required
            placeholder="e.g. John Doe"
            className="bg-glass-bg border border-glass-border text-foreground placeholder:text-muted-foreground backdrop-blur-md"
          />
        </FormGroup>

        <FormGroup label="Password" htmlFor="password">
          <PasswordInput
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
            placeholder="Enter a secure password"
          />
        </FormGroup>

        <FormGroup label="Confirm Password" htmlFor="konfirmasi_password">
          <PasswordInput
            name="konfirmasi_password"
            value={formData.konfirmasi_password}
            onChange={handleChange}
            required
            minLength={8}
            placeholder="Re-enter your password"
          />
        </FormGroup>

        <FormGroup label="Date of Birth" htmlFor="tanggal_lahir">
          <Input
            id="tanggal_lahir"
            name="tanggal_lahir"
            type="date"
            value={formData.tanggal_lahir}
            onChange={handleChange}
            required
            placeholder="YYYY-MM-DD"
            className="bg-glass-bg border border-glass-border text-foreground placeholder:text-muted-foreground backdrop-blur-md"
          />
        </FormGroup>

        <FormGroup label="Gender" htmlFor="jenis_kelamin">
        <select
          id="jenis_kelamin"
          name="jenis_kelamin"
          value={formData.jenis_kelamin}
          onChange={handleChange}
          required
          className="bg-glass-bg border border-glass-border text-sm text-foreground placeholder:text-muted-foreground backdrop-blur-md h-10 px-2 rounded-md w-full appearance-none"
        >
          <option disabled hidden value="">Select Gender</option>
          <option value="laki laki" className="bg-background text-foreground">Male</option>
          <option value="perempuan" className="bg-background text-foreground">Female</option>
        </select>
        </FormGroup>

        <FormGroup label="Region" htmlFor="region">
          <Input
            id="region"
            name="region"
            type="text"
            value={formData.region}
            onChange={handleChange}
            required
            placeholder="e.g. Jakarta, Indonesia"
            className="bg-glass-bg border border-glass-border text-foreground placeholder:text-muted-foreground backdrop-blur-md"
          />
        </FormGroup>

        <FormGroup label="Occupation / Education Status" htmlFor="status">
          <Input
            id="status"
            name="status"
            type="text"
            value={formData.status}
            onChange={handleChange}
            required
            placeholder="e.g. Software Engineer / University Student"
            className="bg-glass-bg border border-glass-border text-foreground placeholder:text-muted-foreground backdrop-blur-md"
          />
        </FormGroup>

        <div className="pt-4 flex justify-center">
          <Button
            type="submit"
            disabled={loading}
            className="w-full font-semibold bg-secondary hover:bg-secondary/90"
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </>
  )
}
