'use client'
import { useMemo, useState } from 'react'
import PersonCard from './PersonCard'

function buildTree(people) {
  const map = new Map()
  people.forEach(p => map.set(p.id, { ...p, reports: [] }))
  const roots = []
  map.forEach((node) => {
    if (node.managerId) {
      const parent = map.get(node.managerId)
      if (parent) parent.reports.push(node)
      else roots.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
}

export default function OrgChart({ people = [], filter = null }) {
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    if (!filter) return people
    return people.filter(p => p.location === filter)
  }, [people, filter])

  const roots = useMemo(() => buildTree(filtered), [filtered])

  return (
    <div className="space-y-4">
      {roots.length === 0 && <div className="text-muted">No people found</div>}
      <div className="flex flex-wrap gap-4">
        {roots.map(r => (
          <div key={r.id} className="w-full md:w-1/3">
            <Node node={r} onSelect={setSelected} />
          </div>
        ))}
      </div>
      {selected}
    </div>
  )
}

function Node({ node, onSelect }) {
  return (
    <div>
      <PersonCard person={node} onClick={() => onSelect(node)} />
      {node.reports && node.reports.length > 0 && (
        <div className="pl-6 mt-2 border-l">
          {node.reports.map(r => (
            <div key={r.id} className="mt-2">
              <Node node={r} onSelect={onSelect} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
