import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { debounce } from '../../utils/helpers';

export default function SearchBar({ compact = false, onSearch, initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);
  const navigate = useNavigate();

  // Sync initialValue if it changes externally (e.g., navigating back)
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Use ref so debounced function always has latest callbacks
  const onSearchRef = useRef(onSearch);
  const navigateRef = useRef(navigate);
  useEffect(() => { onSearchRef.current = onSearch; }, [onSearch]);
  useEffect(() => { navigateRef.current = navigate; }, [navigate]);

  const debouncedSearch = useRef(
    debounce((value) => {
      if (onSearchRef.current) {
        onSearchRef.current(value);
      } else {
        navigateRef.current(`/browse?q=${encodeURIComponent(value)}`);
      }
    }, 400)
  ).current;

  const handleChange = (e) => {
    setQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    } else {
      navigate(`/browse?q=${encodeURIComponent(query)}`);
    }
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="d-none d-lg-block">
        <div className="position-relative">
          <i
            className="bi bi-search position-absolute"
            style={{
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
              fontSize: '0.85rem',
            }}
          ></i>
          <input
            type="search"
            placeholder="Search items..."
            value={query}
            onChange={handleChange}
            className="sc-input"
            style={{
              paddingLeft: '36px',
              width: '220px',
              fontSize: '0.85rem',
              padding: '8px 12px 8px 36px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-surface-2)',
              border: '1px solid transparent',
            }}
            id="nav-search-input"
          />
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="position-relative">
        <i
          className="bi bi-search position-absolute"
          style={{ left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
        ></i>
        <input
          type="search"
          placeholder="Search for items, categories, or people..."
          value={query}
          onChange={handleChange}
          className="sc-input"
          style={{ paddingLeft: '44px', borderRadius: 'var(--radius-full)' }}
          id="main-search-input"
        />
      </div>
    </form>
  );
}
