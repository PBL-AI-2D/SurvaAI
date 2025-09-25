import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  name: string;
}

export function PasswordInput({ label, name, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const toggleVisibility = () => setVisible((prev) => !prev);

  return (
    <div className="relative">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium mb-1 text-foreground">
          {label}
        </label>
      )}
      <Input
        id={name}
        name={name}
        type={visible ? 'text' : 'password'}
        className="pr-10 bg-glass-bg text-foreground placeholder:text-foreground/60 border border-glass-border backdrop-blur-md rounded-md"
        {...props}
      />
      <button
        type="button"
        onClick={toggleVisibility}
        className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground transition"
        tabIndex={-1}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
