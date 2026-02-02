'use client'
import Image from 'next/image'
import { useState } from 'react'
import ProfileModal from './ProfileModal'

export default function PersonCard({ person, onClick }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white p-3 rounded shadow cursor-pointer" onClick={() => setOpen(true)}>
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">{person.name}</div>
          <div className="text-sm text-gray-600">{person.role}</div>
        </div>
        {person.videoUrl && (
          <div title="Has video" className="text-sm text-blue-600">🎬</div>
        )}
      </div>
      {open && <ProfileModal person={person} onClose={() => setOpen(false)} />}
    </div>
  )
}
