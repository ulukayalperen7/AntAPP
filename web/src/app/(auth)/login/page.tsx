'use client'

import { useActionState } from 'react'
import { login } from '@/features/auth/actions'

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(login, null)

  return (
    <form action={formAction}>
      <input name="email" type="email" required placeholder="Email" />
      <input name="password" type="password" required placeholder="Password" />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
