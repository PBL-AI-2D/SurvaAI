import { Metadata } from 'next';
import { LoginPage } from '@/components/pages/auth/login';

export const metadata: Metadata = {
  title: 'Surva. - Login',
  description: 'Sign in with your registered account to access the application.',
};

export default function Register() {
  return <LoginPage />;
}
