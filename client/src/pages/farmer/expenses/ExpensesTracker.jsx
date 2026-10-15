import React, { useState, useMemo } from 'react';
import Modal from '../../../components/common/Modal';

const INITIAL_EXPENSES = [
  { id: 'exp-1', date: '2026-10-02', category: 'Seeds', description: 'Certified Mustard Seeds (Pusa Bold) - 15 kg', amount: 3200, paidTo: 'National Seeds Corp' },
  { id: 'exp-2', date: '2026-09-28', category: 'Fertilizers', description: 'DAP (Di-ammonium Phosphate) - 4 Bags', amount: 5400, paidTo: 'Kisan Seva Kendra' },
  { id: 'exp-3', date: '2026-09-20', category: 'Machinery & Fuel', description: 'Tractor Field Tillage & Rotavator (8 Hours Diesel)', amount: 6800, paidTo: 'Singh Agri Services' },
  { id: 'exp-4', date: '2026-09-12', category: 'Labor', description: 'Nursery Transplanting & Weeding Labor (4 Workers, 2 Days)', amount: 4800, paidTo: 'Village Labor Crew' },
  { id: 'exp-5', date: '2026-09-05', category: 'Plant Protection', description: 'Bio-Fungicide Trichoderma formulation - 5 Litres', amount: 2150, paidTo: 'Agro Bio Chemical Depot' },
];

const CATEGORIES = ['All', 'Seeds', 'Fertilizers', 'Machinery & Fuel', 'Labor', 'Plant Protection', 'Irrigation'];

const ExpensesTracker = () => {
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Seeds',
    description: '',
    amount: '',
    paidTo: '',
  });

  const handleAddExpense = (e) => {
    e.preventDefault();
    const newExp = {
      id: `exp-${Date.now()}`,
      date: form.date,
      category: form.category,
      description: form.description,
      amount: Number(form.amount) || 0,
      paidTo: form.paidTo || 'Local Vendor',
    };
    setExpenses([newExp, ...expenses]);
    setModalOpen(false);
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(
      (e) => selectedCategory === 'All' || e.category === selectedCategory
    );
  }, [expenses, selectedCategory]);

  const totalExpenditure = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenses]);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--color-text)' }}>
            💰 Farm Expenses & Input Ledger
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem', margin: 0 }}>
            Track input costs, seeds, fertilizers, tractor diesel, and farm labor to calculate net crop profit.
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn btn-primary" style={{ fontWeight: 800 }}>
          ➕ Record New Expense
        </button>
      </div>

      {/* Summary Stat Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #174C38 0%, #21664B 100%)',
          color: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem 2rem',
          marginBottom: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Season Input Expenditure
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-accent)' }}>
            ₹{totalExpenditure.toLocaleString('en-IN')}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>Total Entries</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{expenses.length} Records</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>Avg. Cost / Entry</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              ₹{expenses.length ? Math.round(totalExpenditure / expenses.length).toLocaleString('en-IN') : 0}
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className="btn btn-sm"
            style={{
              background: selectedCategory === cat ? 'var(--color-primary)' : 'var(--color-white)',
              color: selectedCategory === cat ? '#FFFFFF' : 'var(--color-text-secondary)',
              border: `1px solid ${selectedCategory === cat ? 'var(--color-primary)' : 'var(--color-border)'}`,
              fontWeight: 600,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Expenses Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Vendor / Payee</th>
              <th style={{ textAlign: 'right' }}>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((exp) => (
              <tr key={exp.id}>
                <td style={{ fontWeight: 600 }}>{exp.date}</td>
                <td>
                  <span
                    className="badge"
                    style={{
                      background: 'var(--color-bg)',
                      color: 'var(--color-primary-dark)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {exp.category}
                  </span>
                </td>
                <td style={{ fontWeight: 600, color: 'var(--color-text)' }}>{exp.description}</td>
                <td style={{ color: 'var(--color-text-secondary)' }}>{exp.paidTo}</td>
                <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--color-primary-dark)', fontSize: '0.95rem' }}>
                  ₹{exp.amount.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Expense Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Record Farm Input Expense">
        <form onSubmit={handleAddExpense}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                className="form-input"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="Seeds">Seeds</option>
                <option value="Fertilizers">Fertilizers & Nutrients</option>
                <option value="Machinery & Fuel">Machinery & Diesel</option>
                <option value="Labor">Labor & Wages</option>
                <option value="Plant Protection">Pesticides & Fungicides</option>
                <option value="Irrigation">Irrigation & Power</option>
                <option value="Packaging & Transport">Packaging & Transport</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 4 Bags DAP Fertilizer or 50L Tractor Diesel"
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Total Amount (₹) *</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 3500"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Paid To / Vendor</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Kisan Seva Kendra"
                value={form.paidTo}
                onChange={(e) => setForm({ ...form, paidTo: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ fontWeight: 800 }}>
              Save Expense Entry
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExpensesTracker;
