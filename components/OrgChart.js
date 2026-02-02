'use client'
import { useMemo } from 'react'
import PersonCard from './PersonCard'

function buildTree(people) {
  // Deprecated: kept for reference. New build logic below.
  return []
}

// Build tree with filter-aware reparenting:
// - `people` is the full list (unfiltered)
// - `filter` is a location filter (string or null)
// Visible nodes are those matching the filter. For a visible node whose direct
// manager is not visible, traverse upward until a visible ancestor is found and
// temporarily assign that ancestor as its parent for rendering. If none found,
// the node becomes a root.
function buildTreeWithFiltering(people, filter) {
  const allMap = new Map()
  people.forEach(p => allMap.set(p.id, { ...p }))

  // Determine which people are visible under the filter
  const visibleMap = new Map()
  people.forEach(p => {
    const visible = !filter || p.location === filter
    if (visible) visibleMap.set(p.id, { ...p })
  })

  // Helper: find nearest visible ancestor id (or null)
  function findVisibleAncestorId(person) {
    let mid = person.managerId
    const visited = new Set()
    while (mid) {
      if (visited.has(mid)) break
      visited.add(mid)
      const mgr = allMap.get(mid)
      if (!mgr) return null
      if (visibleMap.has(mid)) return mid
      mid = mgr.managerId
    }
    return null
  }

  // Create nodes only for visible people
  const nodes = new Map()
  visibleMap.forEach((p, id) => nodes.set(id, { ...p, reports: [] }))

  const roots = []
  // For each visible node, find effective parent (nearest visible ancestor)
  nodes.forEach((node) => {
    const ancestorId = findVisibleAncestorId(node)
    if (ancestorId && nodes.has(ancestorId)) {
      nodes.get(ancestorId).reports.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

export default function OrgChart({ people = [], filter = null }) {
  const roots = useMemo(() => buildTreeWithFiltering(people, filter), [people, filter])

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
