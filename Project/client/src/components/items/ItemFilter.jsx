import { TRANSACTION_TYPES, CATEGORIES, SORT_OPTIONS } from '../../utils/constants';

export default function ItemFilter({ filters = {}, onChange }) {
  const handleChange = (key, value) => {
    onChange?.({ ...filters, [key]: value });
  };

  return (
    <div className="sc-card mb-4 fade-in">
      <div className="d-flex flex-wrap align-items-center gap-3">
        {/* Transaction type chips */}
        <div className="d-flex flex-wrap gap-2">
          <button
            className={`sc-chip ${!filters.type ? 'active' : ''}`}
            onClick={() => handleChange('type', '')}
          >
            All
          </button>
          {TRANSACTION_TYPES.map((t) => (
            <button
              key={t.key}
              className={`sc-chip ${filters.type === t.key ? 'active' : ''}`}
              onClick={() => handleChange('type', t.key)}
            >
              <i className={`bi ${t.icon}`}></i>
              {t.label}
            </button>
          ))}
        </div>

        <div className="ms-auto d-flex gap-2">
          {/* Category */}
          <select
            className="sc-input"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
            value={filters.category || ''}
            onChange={(e) => handleChange('category', e.target.value)}
            id="filter-category"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Sort */}
          <select
            className="sc-input"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
            value={filters.sort || 'newest'}
            onChange={(e) => handleChange('sort', e.target.value)}
            id="filter-sort"
          >
            {SORT_OPTIONS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
