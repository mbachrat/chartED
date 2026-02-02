'use client'
import { useMemo } from 'react'
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
  const filtered = useMemo(() => {
    if (!filter) return people
    return people.filter(p => p.location === filter)
  }, [people, filter])

  const roots = useMemo(() => buildTree(filtered), [filtered])

  if (!roots || roots.length === 0) return <div className="text-muted">No people found</div>

  return (
    <div className="space-y-8">
      {/* Render each top-level root as a vertical tree */}
      {roots.map(root => (
        <div key={root.id} className="w-full">
          <Tree node={root} />
        </div>
      ))}
    </div>
  )
}

function Tree({ node }) {
  // Node card centered
  return (
    <div className="flex flex-col items-center">
      <div className="inline-block">
        <PersonCard person={node} />
      </div>

      {node.reports && node.reports.length > 0 && (
        <>
          {/* vertical connector */}
          <div className="w-px h-6 bg-gray-200 mt-4" />

          {/* children row - will push surrounding content outward naturally */}
          <div className="children flex justify-center gap-8 mt-6 w-full">
            {node.reports.map(child => (
              <div key={child.id} className="flex flex-col items-center">
                <Tree node={child} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
