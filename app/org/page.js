'use client'
import { useEffect, useMemo, useState } from 'react'
import { getDbClient } from '../../lib/firebase'
import OrgChart from '../../components/OrgChart'
import LocationFilter from '../../components/LocationFilter'
import PersonForm from '../../components/PersonForm'

export default function OrgPage() {
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    let unsub = null
    ;(async () => {
      const db = await getDbClient()
      const { collection, onSnapshot, query } = await import('firebase/firestore')
      const q = query(collection(db, 'people'))
      unsub = onSnapshot(q, (snap) => {
        const arr = []
        snap.forEach(d => arr.push({ id: d.id, ...d.data() }))
        setPeople(arr)
        setLoading(false)
      }, (err) => {
        setError(err.message)
        setLoading(false)
      })
    })()
    return () => unsub && unsub()
  }, [])

  const locations = useMemo(() => {
    const s = new Set()
    people.forEach(p => p.location && s.add(p.location))
    return Array.from(s)
  }, [people])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Organization</h2>
        <div className="flex items-center gap-3">
          <LocationFilter locations={locations} value={filter} onChange={setFilter} />
          <button onClick={() => setShowAdd(true)} className="bg-green-600 text-white px-3 py-1 rounded">+ Add Person</button>
        </div>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && <OrgChart people={people} filter={filter} />}

      {showAdd && <PersonForm onClose={() => setShowAdd(false)} />}
    </div>
  )
}
