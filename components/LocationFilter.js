'use client'
const FIXED_LOCATIONS = ['Toronto', 'Vancouver', 'Alberta', 'Texas']

export default function LocationFilter({ value = null, onChange }) {
  return (
    <select value={value || ''} onChange={e => onChange(e.target.value || null)} className="border px-2 py-1 rounded">
      <option value="">All locations</option>
      {FIXED_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
    </select>
  )
}
