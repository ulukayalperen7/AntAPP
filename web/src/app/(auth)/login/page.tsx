'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { login } from '@/features/auth/actions'

export default function LoginPage() {
  const [email, setEmail] = useState('user@antapp.local')
  const [password, setPassword] = useState('123Pa$$word!')
  const [error, formAction, pending] = useActionState(login, null)

  return (
    <main style={{ maxWidth: 520, margin: '56px auto', padding: '0 16px' }}>
      <h1>AntAPP Login</h1>
      <p>Web User, Business ve Admin girişleri buradan yapılır.</p>
      <form
        action={formAction}
        style={{ display: 'grid', gap: 12, marginTop: 20 }}
      >
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p style={{ color: '#c62828' }}>{error}</p>}
        <button type="submit" disabled={pending}>
          {pending ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div style={{ marginTop: 18 }}>
        <p>Test hesaplar:</p>
        <p>
          User: <code>user@antapp.local</code>
        </p>
        <p>
          Business: <code>business@antapp.local</code>
        </p>
        <p>
          Admin: <code>admin@antapp.local</code>
        </p>
        <p>
          Password: <code>123Pa$$word!</code>
        </p>
      </div>
    </main>
  )
}
