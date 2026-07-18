import { Link, useSearch } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { ForgotPasswordForm } from './components/forgot-password-form'
import { ResetPasswordForm } from './components/reset-password-form'

export function ForgotPassword() {
  const { token } = useSearch({ from: '/(auth)/forgot-password' })
  return (
    <AuthLayout>
      <Card className='max-w-sm gap-4 sm:min-w-sm'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>
            {token ? 'Reset Password' : 'Forgot Password'}
          </CardTitle>
          <CardDescription>
            {token
              ? 'Enter a new password for your account.'
              : 'Enter your registered email and we will send you a link to reset your password.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {token ? <ResetPasswordForm token={token} /> : <ForgotPasswordForm />}
        </CardContent>
        <CardFooter>
          <p className='mx-auto px-8 text-center text-sm text-balance text-muted-foreground'>
            Don't have an account?{' '}
            <Link
              to='/sign-up'
              className='underline underline-offset-4 hover:text-primary'
            >
              Sign up
            </Link>
            .
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
