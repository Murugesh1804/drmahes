import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Check, X, Edit2, Trash2 } from 'lucide-react'
import {
  getAllTreatmentMasters, addTreatmentMaster, updateTreatmentMaster,
  deleteTreatmentMaster, searchTreatmentMasters
} from '../services/api'
import { useApp } from '../context/AppContext'
import Modal from '../components/Modal'
import ConfirmModal from '../components/ConfirmModal'

const CATEGORIES = [
  'general', 'endodontics', 'orthodontics', 'prosthodontics', 
  'periodontics', 'surgery', 'cosmetic', 'other'
]

const EMPTY_FORM = {
  treatment_name: '', category: 'general', standard_cost: '', is_active: true
}

export default function TreatmentMaster() {
  const { notify, fmt } = useApp()
  const [treatments, setTreatments] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  // Modal State
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const loadTreatments = useCallback(async () => {
    setLoading(true)
    try {
      const data = search.trim() 
        ? await searchTreatmentMasters(search)
        : await getAllTreatmentMasters(true) // include inactive
      setTreatments(data || [])
    } catch (e) {
      console.error(e)
    } finally { setLoading(false) }
  }, [search])

  useEffect(() => {
    const t = setTimeout(() => loadTreatments(), 300)
    return () => clearTimeout(t)
  }, [search, loadTreatments])

  function openAdd() {
    setForm(EMPTY_FORM)
    setEditId(null)
    setShowAdd(true)
  }

  function openEdit(item) {
    setForm({
      treatment_name: item.treatment_name,
      category: item.category || 'general',
      standard_cost: item.standard_cost || 0,
      is_active: item.is_active
    })
    setEditId(item.id)
    setShowAdd(true)
  }

  async function handleSave() {
    if (!form.treatment_name.trim()) { notify('Treatment name required', 'error'); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        standard_cost: parseFloat(form.standard_cost) || 0
      }
      if (editId) {
        await updateTreatmentMaster(editId, payload)
        notify('Treatment updated')
      } else {
        await addTreatmentMaster(payload)
        notify('Treatment added')
      }
      setShowAdd(false)
      setEditId(null)
      loadTreatments()
    } catch (e) {
      notify(e.message || 'Failed to save', 'error')
    } finally { setSaving(false) }
  }

  async function handleToggleActive(item) {
    try {
      await updateTreatmentMaster(item.id, { is_active: !item.is_active })
      notify(item.is_active ? 'Treatment deactivated' : 'Treatment activated')
      loadTreatments()
    } catch (e) {
      notify(e.message || 'Failed', 'error')
    }
  }

  async function handleDeleteConfirm() {
    try {
      await deleteTreatmentMaster(deleteId)
      notify('Treatment deleted')
      loadTreatments()
    } catch (e) {
      notify(e.message || 'Failed', 'error')
    } finally { setDeleteId(null) }
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Treatment Master</h2>
          <p className="text-sm text-slate-400">Manage clinic treatments and pricing per tooth</p>
        </div>
        <button id="btn-add-treatment-master" onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add Treatment
        </button>
      </div>

      <div className="card space-y-4">
        <div className="relative w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search treatments…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading…</div>
        ) : treatments.length === 0 ? (
          <div className="empty-state py-16">
            <p className="font-semibold text-slate-500">No treatments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Treatment Name</th>
                  <th>Category</th>
                  <th>Cost Per Tooth</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {treatments.map(t => (
                  <tr key={t.id} className={!t.is_active ? 'opacity-50 bg-slate-50' : ''}>
                    <td className="font-semibold text-slate-800">{t.treatment_name}</td>
                    <td className="capitalize text-slate-600">{t.category}</td>
                    <td className="font-semibold">{fmt(t.standard_cost)}</td>
                    <td>
                      <button
                        onClick={() => handleToggleActive(t)}
                        className={`text-xs font-bold px-2 py-0.5 rounded-full transition-colors ${
                          t.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                        }`}
                      >
                        {t.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(t)} className="btn-icon text-slate-400 hover:text-primary-600" title="Edit">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteId(t.id)} className="btn-icon text-slate-300 hover:text-red-500" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={showAdd}
        onClose={() => { setShowAdd(false); setEditId(null) }}
        title={editId ? 'Edit Treatment' : 'Add Treatment'}
        size="sm"
        footer={
          <>
            <button onClick={() => { setShowAdd(false); setEditId(null) }} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : editId ? 'Update' : 'Add'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Treatment Name *</label>
            <input className="input" placeholder="e.g. Extraction" value={form.treatment_name} onChange={set('treatment_name')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="select capitalize" value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Cost Per Tooth (₹)</label>
              <input className="input" type="number" min="0" placeholder="0" value={form.standard_cost} onChange={set('standard_cost')} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" id="active-check" className="w-4 h-4 text-primary-600" checked={form.is_active} onChange={set('is_active')} />
            <label htmlFor="active-check" className="text-sm font-semibold text-slate-700 select-none cursor-pointer">Active</label>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Treatment"
        message="Are you sure you want to deactivate/delete this treatment? You can also just mark it inactive."
        confirmText="Delete"
      />
    </div>
  )
}
