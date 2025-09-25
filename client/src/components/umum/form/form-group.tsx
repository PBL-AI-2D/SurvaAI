import React from 'react'

interface FormGroupProps {
  label: string
  htmlFor: string
  children: React.ReactNode
  className?: string
}

export function FormGroup({
  label,
  htmlFor,
  children,
  className = '',
}: FormGroupProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  )
}
