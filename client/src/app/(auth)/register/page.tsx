import { Metadata } from 'next';
import { RegisterPage } from '@/components/pages/auth/register';

export const metadata: Metadata = {
  title: 'Surva. - Register',
  description: 'Create a new account to get started with our application.',
};

export default function Register() {
  return <RegisterPage />;
}
