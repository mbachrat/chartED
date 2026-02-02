'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthClient } from '../../lib/firebase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isSignUp, setIsSignUp] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const auth = await getAuthClient()
      const { createUserWithEmailAndPassword, signInWithEmailAndPassword } = await import('firebase/auth')
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      router.push('/org')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-24 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">{isSignUp ? 'Sign up' : 'Sign in'}</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="w-full border px-3 py-2 rounded" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" className="w-full border px-3 py-2 rounded" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <div className="text-red-600">{error}</div>}
        <div className="flex items-center justify-between">
          <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">{isSignUp ? 'Create account' : 'Sign in'}</button>
          <button type="button" className="text-sm" onClick={() => setIsSignUp(s => !s)}>{isSignUp ? 'Have an account? Sign in' : 'No account? Sign up'}</button>
        </div>
      </form>
    </div>
  )
}
