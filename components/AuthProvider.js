"use client"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getAuthClient } from '../lib/firebase'

export default function AuthProvider({ children }) {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    let unsub = null
    ;(async () => {
      const auth = await getAuthClient()
      const { onAuthStateChanged } = await import('firebase/auth')
      unsub = onAuthStateChanged(auth, (u) => {
        setUser(u)
        if (!u) router.push('/login')
      })
    })()
    return () => unsub && unsub()
  }, [router])

  async function handleLogout() {
    const auth = await getAuthClient()
    const { signOut } = await import('firebase/auth')
    await signOut(auth)
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-semibold">chartED</h1>
          <div>
            {user && (
              <button onClick={handleLogout} className="text-sm text-red-600">Logout</button>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4">{children}</main>
    </div>
  )
}
