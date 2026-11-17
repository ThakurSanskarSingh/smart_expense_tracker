/**
 * @fileoverview Category management page supporting creation, color theming,
 * editing, and safe deletion with automatic reassignment to 'Other'.
 */

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client.js';
import { useNotification } from '../context/NotificationContext.jsx';
import Modal from '../components/common/Modal.jsx';
import Skeleton from '../components/common/Skeleton.jsx';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();

  // Create / Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [icon, setIcon] = useState('tag');
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/categories');
      setCategories(res.data || []);
    } catch (err) {
      addToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setColor('#3B82F6');
    setIcon('tag');
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setColor(cat.color || '#3B82F6');
    setIcon(cat.icon || 'tag');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      if (editingCategory) {
        await apiClient.put(`/categories/${editingCategory._id}`, { name: name.trim(), color, icon });
        addToast('Category updated successfully', 'success');
      } else {
        await apiClient.post('/categories', { name: name.trim(), color, icon });
        addToast('Category created successfully', 'success');
      }
      setModalOpen(false);
      await loadCategories();
    } catch (err) {
      addToast(err.message || 'Failed to save category', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    try {
      setSubmitting(true);
      const res = await apiClient.delete(`/categories/${deletingCategory._id}`);
      addToast(res.data?.message || 'Category deleted', 'success');
      setDeleteModalOpen(false);
      await loadCategories();
    } catch (err) {
      addToast(err.message || 'Failed to delete category', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Category Management</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Organize transactions into predefined system categories or create your own
          </p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          + New Category
        </button>
      </div>

      {loading ? (
        <div className="grid-cols-3">
          <Skeleton height="90px" />
          <Skeleton height="90px" />
          <Skeleton height="90px" />
        </div>
      ) : (
        <div className="grid-cols-3">
          {categories.map((cat) => (
            <div key={cat._id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: cat.color || '#3B82F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                  }}
                >
                  {cat.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{cat.name}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                    {cat.isDefault ? (
                      <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                        System Default
                      </span>
                    ) : (
                      <span className="badge" style={{ fontSize: '0.65rem', background: 'var(--bg-surface-hover)' }}>
                        Custom
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button onClick={() => openEditModal(cat)} className="btn btn-secondary btn-icon" title="Edit">
                  ✏️
                </button>
                {!cat.isDefault && (
                  <button
                    onClick={() => {
                      setDeletingCategory(cat);
                      setDeleteModalOpen(true);
                    }}
                    className="btn btn-secondary btn-icon"
                    style={{ color: 'var(--danger)' }}
                    title="Delete"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Custom Category'}
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Subscriptions, Gym, Coffee"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Theme Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: '45px', height: '40px', padding: '0', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
              />
              <input
                type="text"
                className="form-control"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#3B82F6"
                style={{ maxWidth: '140px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Custom Category"
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          Are you sure you want to delete category <strong>{deletingCategory?.name}</strong>? Any existing expense records filed under this category will automatically be reassigned to the default <strong>Other</strong> category.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" onClick={() => setDeleteModalOpen(false)} className="btn btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleDelete} className="btn btn-danger" disabled={submitting}>
            {submitting ? 'Deleting...' : 'Delete & Reassign'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
