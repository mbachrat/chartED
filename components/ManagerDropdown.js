"use client"
import { useEffect, useMemo, useState } from 'react'
import { getDbClient } from '../lib/firebase'

// Helper: build descendants map to prevent cycles
function getDescendantsMap(people) {
  const map = new Map()
  const children = new Map()
  people.forEach(p => children.set(p.id, []))
  people.forEach(p => { if (p.managerId && children.has(p.managerId)) children.get(p.managerId).push(p.id) })

  function collect(id, acc) {
    const list = children.get(id) || []
    list.forEach(c => {
      acc.add(c)
      collect(c, acc)
    })
  }

  people.forEach(p => {
    const set = new Set()
    collect(p.id, set)
    map.set(p.id, set)
  })
  return map
}

export default function ManagerDropdown({ currentId, value, onChange }) {
  const [people, setPeople] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    let unsub = null
    ;(async () => {
      const db = await getDbClient()
      const { collection, onSnapshot } = await import('firebase/firestore')
      unsub = onSnapshot(collection(db, 'people'), (snap) => {
        const arr = []
        snap.forEach(d => arr.push({ id: d.id, ...d.data() }))
        setPeople(arr)
      })
    })()
    return () => unsub && unsub()
  }, [])

  const descendantsMap = useMemo(() => getDescendantsMap(people), [people])

  const invalid = useMemo(() => {
    const s = new Set()
    if (descendantsMap.has(currentId)) {
      descendantsMap.get(currentId).forEach(d => s.add(d))
    }
    s.add(currentId)
    return s
  }, [descendantsMap, currentId])

  function handleChange(v) {
    if (v && invalid.has(v)) {
      setError('Cannot set manager to self or a direct/indirect report (would create a cycle).')
      return
    }
    setError(null)
    onChange(v === '' ? null : v)
  }

  return (
    <div>
      <select value={value || ''} onChange={e => handleChange(e.target.value)} className="border px-2 py-1 rounded w-full">
        <option value="">None (Top-level)</option>
        {people.filter(p => p.id !== currentId).map(p => (
          <option key={p.id} value={p.id} disabled={invalid.has(p.id)}>{p.name} — {p.role}</option>
        ))}
      </select>
      {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
    </div>
  )
}
