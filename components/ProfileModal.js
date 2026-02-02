"use client"
import { useEffect, useState } from 'react'
import { getDbClient } from '../lib/firebase'
import PersonForm from './PersonForm'
import ManagerDropdown from './ManagerDropdown'

export default function ProfileModal({ person, onClose }) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState(person)
  const [error, setError] = useState(null)

  useEffect(() => setLocal(person), [person])

  async function save() {
    setError(null)
    try {
      const db = await getDbClient()
      const { doc, updateDoc } = await import('firebase/firestore')
      const ref = doc(db, 'people', person.id)
      await updateDoc(ref, { ...local, updatedAt: new Date() })
      setEditing(false)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this person?')) return
    // set direct reports' managerId to null
    const db = await getDbClient()
    const { collection, query, where, getDocs, writeBatch, doc } = await import('firebase/firestore')
    const q = query(collection(db, 'people'), where('managerId', '==', person.id))
    const snap = await getDocs(q)
    const batch = writeBatch(db)
    snap.forEach(s => batch.update(s.ref, { managerId: null }))
    batch.delete(doc(db, 'people', person.id))
    await batch.commit()
    onClose()
  }

  return (
    <div className="fixed inset-0 flex items-start justify-center modal-backdrop z-50" onClick={() => onClose()}>
      <div className="bg-white w-full max-w-md lg:max-w-2xl mt-16 rounded shadow-lg p-6 max-h-[calc(100vh-6rem)] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold">Employee Profile</h3>
          <button className="text-gray-600" onClick={onClose}>✕</button>
        </div>

        <div className="mt-4">
            {person.videoUrl && (
            <div className="w-full mb-4">
              <div className="bg-black rounded overflow-hidden shadow-inner">
                <video src={person.videoUrl} controls className="w-full max-h-56 md:max-h-72 object-contain bg-black" />
              </div>
            </div>
          )}

          <div className="text-center">
            <div className="text-xl font-semibold">{person.name}</div>
            <div className="text-sm text-gray-500">{person.role}</div>

            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm">{person.role}</span>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm">{person.location}</span>
            </div>
          </div>

          {!editing ? (
            <div className="mt-6 space-y-4">
              <div className="bg-white p-4 rounded shadow-sm">
                <h4 className="font-semibold mb-2">About</h4>
                <p className="text-sm text-slate-700">{person.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded shadow-sm flex items-center gap-3">
                  <div className="text-blue-600">✉️</div>
                  <div>
                    <div className="text-xs text-slate-500">Email</div>
                    <div className="font-medium"><a className="text-blue-600" href={`mailto:${person.email}`}>{person.email}</a></div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded shadow-sm flex items-center gap-3">
                  <div className="text-green-600">📞</div>
                  <div>
                    <div className="text-xs text-slate-500">Phone</div>
                    <div className="font-medium">{person.phone || '—'}</div>
                  </div>
                </div>
              </div>

              <div className="mt-3 p-4 rounded border-l-4 border-yellow-300 bg-yellow-50">
                <div className="text-sm font-semibold">Coffee Chat</div>
                <div className="text-sm text-slate-700">{person.coffeeChatAvailability ? '✓ Available for coffee chats - Feel free to reach out!' : 'Not available for coffee chats'}</div>
              </div>

              <div className="flex justify-end">
                <button className="text-sm text-gray-600 mr-4" onClick={() => setEditing(true)}>Edit</button>
                <button className="text-red-600 text-sm" onClick={handleDelete}>Delete person</button>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <PersonForm person={local} onChange={setLocal} />
              <div className="mt-3">
                <div className="text-sm text-gray-600">Reports to</div>
                <ManagerDropdown currentId={person.id} value={local.managerId || null} onChange={(v) => setLocal(s => ({ ...s, managerId: v }))} />
              </div>
              {error && <div className="text-red-600 mt-2">{error}</div>}
              <div className="mt-3 flex gap-2 justify-end">
                <button className="px-3 py-1 border rounded" onClick={() => setEditing(false)}>Cancel</button>
                <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={save}>Save</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
