import { useState, useRef } from 'react';
import { TRANSACTION_TYPES, CATEGORIES, CONDITIONS } from '../../utils/constants';
import { validateItemForm } from '../../utils/validators';
import { formatFileSize } from '../../utils/helpers';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position === null ? null : <Marker position={position}></Marker>;
}

export default function ItemForm({ initialData, onSubmit, loading = false }) {
  const [form, setForm] = useState({
    title: '', description: '', price: '', mrp: '', deposit: '',
    rentPerDay: '', borrowPerDay: '', wantInReturn: '',
    category: '', transactionType: 'buy', condition: 'good', location: '',
    ...initialData,
  });
  const [mapPosition, setMapPosition] = useState(null);
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const [wantImage, setWantImage] = useState(null);
  const [wantImagePreview, setWantImagePreview] = useState(null);

  const MAX_IMAGES = 5;
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  const txType = form.transactionType;
  const isExchange = txType === 'exchange';
  const isDonate = txType === 'donate';
  const isRent = txType === 'rent';
  const isBorrow = txType === 'borrow';
  const isShare = txType === 'share';
  const isBuyOrSell = txType === 'buy' || txType === 'sell';

  // Fields visibility rules
  const showMrp = isBuyOrSell || isRent || isBorrow || isShare;
  const showPrice = isBuyOrSell; // Removed for rent, borrow, share
  const showRentPerDay = isRent;
  const showBorrowPerDay = isBorrow;
  const showSharePerDay = isShare;
  const showDeposit = isRent || isBorrow || isShare;
  const showWantInReturn = isExchange || isBorrow || isShare;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: '' });

    if (name === 'deposit' && form.mrp && Number(value) > Number(form.mrp)) {
      setErrors({ ...errors, deposit: 'Deposit cannot exceed MRP' });
    }
    if (name === 'mrp' && form.deposit && Number(form.deposit) > Number(value)) {
      setErrors({ ...errors, deposit: 'Deposit cannot exceed MRP' });
    }
  };

  const processFiles = (files) => {
    const validFiles = [];
    const remaining = MAX_IMAGES - images.length;
    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      if (file.size > MAX_SIZE) {
        setErrors((prev) => ({ ...prev, images: `${file.name} exceeds 5MB limit` }));
        continue;
      }
      validFiles.push({ file, preview: URL.createObjectURL(file) });
    }
    if (validFiles.length > 0) {
      setImages((prev) => [...prev, ...validFiles]);
      setErrors((prev) => ({ ...prev, images: '' }));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files) processFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) processFiles(Array.from(e.dataTransfer.files));
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragActive(false); };

  const removeImage = (index) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleWantImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setWantImage(file);
      setWantImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateItemForm(form);

    if (showDeposit && form.deposit && form.mrp && Number(form.deposit) > Number(form.mrp)) {
      validationErrors.deposit = 'Deposit cannot exceed MRP';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const submitData = { ...form, coordinates: mapPosition ? [mapPosition.lng, mapPosition.lat] : null };

    if (isExchange || isDonate) {
      submitData.price = 0;
      submitData.mrp = 0;
      submitData.deposit = 0;
    }
    if (isShare || isRent || isBorrow) {
      submitData.price = 0;
    }
    if (isExchange) {
      submitData.mrp = 0;
      submitData.deposit = 0;
    }

    onSubmit?.(submitData, images.map((img) => img.file));
  };

  return (
    <form onSubmit={handleSubmit} className="fade-in">
      <div className="row g-4">
        <div className="col-md-8">
          <div className="sc-card">
            <h5 className="fw-bold mb-4">Item Details</h5>

            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Title</label>
              <input type="text" name="title" value={form.title} onChange={handleChange}
                className={`sc-input ${errors.title ? 'border-danger' : ''}`}
                placeholder="What are you listing?" id="item-title" />
              {errors.title && <small className="text-danger">{errors.title}</small>}
              <small className="d-block mt-1" style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Provide a clear and concise title for your item.</small>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={5}
                className={`sc-input ${errors.description ? 'border-danger' : ''}`}
                placeholder="Describe your item, its condition, and any relevant details..." id="item-description" />
              {errors.description && <small className="text-danger">{errors.description}</small>}
              <small className="d-block mt-1" style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Include details like dimensions, age, and reason for listing.</small>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Photos</label>
              <div
                className="text-center py-5 rounded-3"
                style={{
                  border: `2px dashed ${dragActive ? 'var(--text-tertiary)' : 'var(--border-color)'}`,
                  background: dragActive ? 'var(--bg-surface-2)' : 'var(--bg-body)',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                }}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <p className="mb-1" style={{ color: 'var(--text-secondary)' }}>Drag & drop images or click to browse</p>
                <small style={{ color: 'var(--text-tertiary)' }}>PNG, JPG up to 5MB each &middot; Max {MAX_IMAGES} images ({images.length}/{MAX_IMAGES})</small>
                <input ref={fileInputRef} type="file" multiple accept="image/*" className="d-none" id="item-images" onChange={handleFileSelect} />
              </div>
              {errors.images && <small className="text-danger mt-1 d-block">{errors.images}</small>}

              {images.length > 0 && (
                <div className="d-flex flex-wrap gap-2 mt-3">
                  {images.map((img, i) => (
                    <div key={i} className="position-relative"
                      style={{ width: 100, height: 100, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      <img src={img.preview} alt={`Preview ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button type="button" onClick={() => removeImage(i)}
                        className="position-absolute d-flex align-items-center justify-content-center"
                        style={{ top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', fontSize: '0.7rem', cursor: 'pointer', lineHeight: 1 }}>
                        ✕
                      </button>
                      <small className="position-absolute text-center w-100"
                        style={{ bottom: 0, left: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '0.6rem', padding: '1px 0' }}>
                        {formatFileSize(img.file.size)}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {showWantInReturn && (
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {isExchange ? 'What do you want in exchange?' : 'What do you want to offer?'}
                </label>
                <textarea name="wantInReturn" value={form.wantInReturn} onChange={handleChange} rows={3}
                  className="sc-input" placeholder={isExchange ? 'Describe what item you would like in exchange...' : 'E.g., Will take great care, happy to leave a deposit...'} />
                <small className="d-block mt-1" style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                  {isExchange ? 'Provide a description of the items you are willing to accept.' : 'Add any additional offer details or guarantees.'}
                </small>

                <div className="mt-2 d-flex align-items-center gap-2">
                  <label className="sc-btn sc-btn-outline sc-btn-sm" style={{ cursor: 'pointer' }}>
                    Add Photo (Optional)
                    <input type="file" className="d-none" accept="image/*" onChange={handleWantImageChange} />
                  </label>
                  {wantImagePreview && (
                    <div style={{ width: 50, height: 50, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      <img src={wantImagePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="col-md-4">
          <div className="sc-card mb-4">
            <h5 className="fw-bold mb-4">Listing Info</h5>

            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Transaction Type</label>
              <select name="transactionType" value={form.transactionType} onChange={handleChange}
                className={`sc-input ${errors.transactionType ? 'border-danger' : ''}`} id="item-type">
                {TRANSACTION_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
              {errors.transactionType && <small className="text-danger">{errors.transactionType}</small>}
              <small className="d-block mt-1" style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                {txType === 'buy' && 'New item for sale. Buyers can purchase directly.'}
                {txType === 'sell' && 'Second-hand item for sale. Buyers can purchase directly.'}
                {txType === 'rent' && 'Item available for rent. Set daily rate and deposit.'}
                {txType === 'borrow' && 'Item can be borrowed temporarily. Set daily rate and deposit.'}
                {txType === 'share' && 'Share your item temporarily. Subject to return.'}
                {txType === 'exchange' && 'Exchange permanently. Describe what you want in return.'}
                {txType === 'donate' && 'Free donation. Only platform & delivery charges apply.'}
              </small>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Category</label>
              <select name="category" value={form.category} onChange={handleChange}
                className={`sc-input ${errors.category ? 'border-danger' : ''}`} id="item-category">
                <option value="">Select category...</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <small className="text-danger">{errors.category}</small>}
              <small className="d-block mt-1" style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Select the most appropriate category for your item.</small>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Condition</label>
              <select name="condition" value={form.condition} onChange={handleChange} className="sc-input" id="item-condition">
                {CONDITIONS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
              <small className="d-block mt-1" style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Accurately describe the current state of the item.</small>
            </div>

            {showMrp && (
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>MRP (₹)</label>
                <input type="number" name="mrp" value={form.mrp} onChange={handleChange}
                  className="sc-input" placeholder="Original MRP" min="0" id="item-mrp" />
                <small className="d-block mt-1" style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Original Retail Price of the product.</small>
              </div>
            )}

            {showPrice && (
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Selling Price (₹)</label>
                <input type="number" name="price" value={form.price} onChange={handleChange}
                  className="sc-input" placeholder="Price" min="0" id="item-price" />
                <small className="d-block mt-1" style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>The final price you want to sell this item for.</small>
              </div>
            )}

            {showRentPerDay && (
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Rent Price Per Day (₹)</label>
                <input type="number" name="rentPerDay" value={form.rentPerDay} onChange={handleChange}
                  className="sc-input" placeholder="Daily rent amount" min="0" />
                <small className="d-block mt-1" style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Amount charged for each day of rental.</small>
              </div>
            )}

            {showBorrowPerDay && (
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Borrow Price Per Day (₹)</label>
                <input type="number" name="borrowPerDay" value={form.borrowPerDay} onChange={handleChange}
                  className="sc-input" placeholder="Daily borrow amount" min="0" />
                <small className="d-block mt-1" style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Amount charged for each day the item is borrowed.</small>
              </div>
            )}

            {showSharePerDay && (
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Share Price Per Day (₹)</label>
                <input type="number" name="sharePerDay" value={form.sharePerDay} onChange={handleChange}
                  className="sc-input" placeholder="Daily share amount" min="0" />
                <small className="d-block mt-1" style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Amount charged for each day the item is shared.</small>
              </div>
            )}

            {showDeposit && (
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Deposit Amount (₹)</label>
                <input type="number" name="deposit" value={form.deposit} onChange={handleChange}
                  className={`sc-input ${errors.deposit ? 'border-danger' : ''}`}
                  placeholder="Refundable deposit (≤ MRP)" min="0" />
                {errors.deposit && <small className="text-danger">{errors.deposit}</small>}
                <small className="d-block mt-1" style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Cannot exceed MRP. Refunded when item is returned undamaged.</small>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Location Area (City)</label>
              <input type="text" name="location" value={form.location} onChange={handleChange}
                className="sc-input" placeholder="City or area" id="item-location" />
              <small className="d-block mt-1" style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>City or general area where the item is located.</small>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Pin Exact Location (Optional)</label>
              <div style={{ height: 200, width: '100%', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)', zIndex: 0 }}>
                <MapContainer center={[23.0225, 72.5714]} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker position={mapPosition} setPosition={setMapPosition} />
                </MapContainer>
              </div>
              {mapPosition && <small className="text-success mt-1 d-block">Location pinned!</small>}
              <small className="d-block mt-1" style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Pin your exact location to help users find your item on the map.</small>
            </div>
          </div>

          <button type="submit" className="sc-btn sc-btn-primary w-100 sc-btn-lg" disabled={loading} id="item-submit">
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Publishing...</> : 'Publish Listing'}
          </button>
        </div>
      </div>
    </form>
  );
}
