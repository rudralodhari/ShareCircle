import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/common/SearchBar';
import ItemFilter from '../components/items/ItemFilter';
import ItemGrid from '../components/items/ItemGrid';
import Pagination from '../components/common/Pagination';
import itemService from '../services/itemService';
import { MOCK_ITEMS, ITEMS_PER_PAGE } from '../utils/constants';

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = searchParams.get('type') || '';
  const initialQuery = searchParams.get('q') || '';

  const [filters, setFilters] = useState({
    type: initialType,
    category: '',
    sort: 'newest',
  });
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);

  // Sync state with URL params when they change
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      type: searchParams.get('type') || ''
    }));
    setSearchQuery(searchParams.get('q') || '');
  }, [searchParams]);

  // Items from API
  const [apiItems, setApiItems] = useState(null); // null = not loaded yet
  const [apiAvailable, setApiAvailable] = useState(false); // true when backend responded successfully
  const [apiTotal, setApiTotal] = useState(0);
  const [apiPages, setApiPages] = useState(1);
  const [apiLoading, setApiLoading] = useState(true);

  // Fetch items from backend
  useEffect(() => {
    const fetchItems = async () => {
      setApiLoading(true);
      try {
        const params = {
          page,
          limit: ITEMS_PER_PAGE,
          sort: filters.sort,
        };
        if (filters.type) params.type = filters.type;
        if (filters.category) params.category = filters.category;
        if (searchQuery.trim()) params.q = searchQuery.trim();

        const res = await itemService.getAll(params);
        setApiItems(res.data.items);
        setApiTotal(res.data.total || 0);
        setApiPages(res.data.pages || 1);
        setApiAvailable(true);
      } catch {
        // If backend is not available, use mock data
        setApiItems(null);
        setApiAvailable(false);
      }
      setApiLoading(false);
    };
    fetchItems();
  }, [filters, searchQuery, page]);

  // Handle filter changes — reset to page 1
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  // Handle search — update URL param and reset page
  const handleSearch = (q) => {
    setSearchQuery(q);
    setSearchParams(q ? { q } : {});
    setPage(1);
  };

  // Fallback: client-side filtering on MOCK_ITEMS if API is unavailable
  const fallbackItems = useMemo(() => {
    if (apiAvailable) return null; // API worked, no need for fallback

    let result = [...MOCK_ITEMS];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.owner.name.toLowerCase().includes(q)
      );
    }

    if (filters.type) {
      result = result.filter((item) => item.transactionType === filters.type);
    }

    if (filters.category) {
      result = result.filter((item) => item.category === filters.category);
    }

    switch (filters.sort) {
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'price_low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return result;
  }, [apiAvailable, searchQuery, filters]);

  // Determine which items to display
  // apiAvailable = backend responded (even with 0 items) → trust API results
  // !apiAvailable = backend unreachable → use client-side filtered mock data
  const displayItems = apiAvailable ? (apiItems || []) : (fallbackItems || MOCK_ITEMS);
  const totalPages = apiAvailable
    ? Math.max(1, apiPages)
    : Math.max(1, Math.ceil(displayItems.length / ITEMS_PER_PAGE));
  const pagedItems = apiAvailable
    ? displayItems // API already paginates
    : displayItems.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="sc-container sc-section fade-in" style={{ paddingTop: 'var(--space-8)' }}>
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Browse Items</h2>
        <p style={{ color: 'var(--text-tertiary)' }}>
          Discover items shared by your community
          {(apiAvailable ? apiTotal : displayItems.length) > 0 && (
            <span className="ms-2" style={{ color: 'var(--primary-500)', fontWeight: 600 }}>
              — {apiAvailable ? apiTotal : displayItems.length} result{(apiAvailable ? apiTotal : displayItems.length) !== 1 ? 's' : ''} found
            </span>
          )}
        </p>
      </div>

      <div className="mb-4">
        <SearchBar initialValue={searchQuery} onSearch={handleSearch} />
      </div>

      <ItemFilter filters={filters} onChange={handleFilterChange} />

      {apiLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: 'var(--primary-500)' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3" style={{ color: 'var(--text-tertiary)' }}>Loading items...</p>
        </div>
      ) : (!filters.type && !filters.category && !searchQuery) ? (
        // Category Grouping View (Phase 3)
        <div className="d-flex flex-column gap-5">
          {['Electronics', 'Books', 'Furniture', 'Clothing', 'Sports', 'Garden', 'Kitchen', 'Tools', 'Toys', 'Vehicles', 'Other'].map(cat => {
            const catItems = displayItems.filter(i => i.category === cat).slice(0, 4); // show up to 4 per category
            if (catItems.length === 0) return null;
            return (
              <div key={cat}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="fw-bold m-0">{cat}</h4>
                  <button className="sc-btn sc-btn-ghost sc-btn-sm" onClick={() => handleFilterChange({...filters, category: cat})}>
                    View All <i className="bi bi-arrow-right"></i>
                  </button>
                </div>
                <ItemGrid items={catItems} />
              </div>
            );
          })}
        </div>
      ) : (
        // Flat Grid View
        <>
          <ItemGrid items={pagedItems} emptyMessage={searchQuery || filters.type || filters.category ? 'No items match your search' : 'No items yet'} />
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
