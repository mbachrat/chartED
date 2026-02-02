'use client'
import { useState, useEffect } from 'react'
import { getDbClient } from '../lib/firebase'

export default function PersonForm({ person = null, onClose = () => {}, onChange }) {
  const [form, setForm] = useState({
    name: '', role: '', location: '', description: '', email: '', phone: '', coffeeChatAvailability: false, videoUrl: '', managerId: null
  })

  useEffect(() => {
    if (person) setForm(prev => ({ ...prev, ...person }))
  }, [person])

  async function handleCreate(e) {
    e && e.preventDefault && e.preventDefault()
    const payload = { ...form, createdAt: new Date(), updatedAt: new Date() }
    // If parent provided onChange (editing inside ProfileModal), don't perform DB ops here.
    if (onChange) {
      return
    }

    if (person && person.id) {
      const db = await getDbClient()
      const { doc, updateDoc } = await import('firebase/firestore')
      await updateDoc(doc(db, 'people', person.id), payload)
      onClose()
      return
    }

    const db = await getDbClient()
    const { addDoc, collection } = await import('firebase/firestore')
    await addDoc(collection(db, 'people'), payload)
    onClose()
  }

  const LOCATIONS = ['Toronto', 'Vancouver', 'Alberta', 'Texas']

  // helper to update form and notify parent if editing in-place
  function updateField(updater) {
    setForm(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      if (onChange) onChange(next)
      return next
    })
  }

  return (
    <form onSubmit={handleCreate} className="space-y-2 bg-white p-4 rounded shadow">
      <input placeholder="Name" value={form.name} onChange={e => updateField(s => ({ ...s, name: e.target.value }))} className="w-full border px-2 py-1 rounded" />
      <input placeholder="Role" value={form.role} onChange={e => updateField(s => ({ ...s, role: e.target.value }))} className="w-full border px-2 py-1 rounded" />
      <select value={form.location || ''} onChange={e => updateField(s => ({ ...s, location: e.target.value }))} className="w-full border px-2 py-1 rounded">
        <option value="">Select location</option>
        {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
      </select>
      <input placeholder="Email" value={form.email} onChange={e => updateField(s => ({ ...s, email: e.target.value }))} className="w-full border px-2 py-1 rounded" />
      <input placeholder="Phone (optional)" value={form.phone || ''} onChange={e => updateField(s => ({ ...s, phone: e.target.value }))} className="w-full border px-2 py-1 rounded" />
      <input placeholder="Video URL (optional)" value={form.videoUrl} onChange={e => updateField(s => ({ ...s, videoUrl: e.target.value }))} className="w-full border px-2 py-1 rounded" />
      <textarea placeholder="Description" value={form.description} onChange={e => updateField(s => ({ ...s, description: e.target.value }))} className="w-full border px-2 py-1 rounded" />
      <div className="flex items-center gap-2">
        <input id="coffee" type="checkbox" checked={form.coffeeChatAvailability} onChange={e => updateField(s => ({ ...s, coffeeChatAvailability: e.target.checked }))} />
        <label htmlFor="coffee">Available for coffee chats</label>
      </div>

      {!onChange && (
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-1">Cancel</button>
          <button className="bg-green-600 text-white px-3 py-1 rounded" type="submit">{person ? 'Save' : 'Create'}</button>
        </div>
      )}
    </form>
  )
}
