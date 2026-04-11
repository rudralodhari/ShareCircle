import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MOCK_ITEMS } from '../utils/constants';
import { formatPrice, timeAgo, getTypeColor, placeholderImage } from '../utils/helpers';
import useAuth from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import itemService from '../services/itemService';
import orderService from '../services/orderService';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon paths in React
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// ── Transaction type labels & descriptions ──
const TYPE_INFO = {
  buy: { label: 'Buy — New Item', desc: 'Brand new item available for purchase', icon: 'bi-cart-check', actionLabel: 'Buy Now', actionIcon: 'bi-bag-check' },
  sell: { label: 'Sell — Second Hand', desc: 'Pre-owned item in described condition', icon: 'bi-tag', actionLabel: 'Buy Now', actionIcon: 'bi-bag-check' },
  rent: { label: 'Rent', desc: 'Rent this item for a set period and return it', icon: 'bi-key', actionLabel: 'Rent Now', actionIcon: 'bi-key' },
  borrow: { label: 'Borrow', desc: 'Borrow this item temporarily and return it', icon: 'bi-arrow-left-right', actionLabel: 'Request to Borrow', actionIcon: 'bi-arrow-left-right' },
  share: { label: 'Share', desc: 'Temporarily share — item will be returned to owner', icon: 'bi-people', actionLabel: 'Request to Share', actionIcon: 'bi-people' },
  exchange: { label: 'Exchange', desc: 'Permanent swap — exchange your item for this one', icon: 'bi-repeat', actionLabel: 'Propose Exchange', actionIcon: 'bi-repeat' },
  donate: { label: 'Donate', desc: 'Free item — only platform & delivery charges apply', icon: 'bi-gift', actionLabel: 'Claim Donation', actionIcon: 'bi-gift' },
};

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();
  const [saved, setSaved] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [contacted, setContacted] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Date picker state for rent/borrow/share
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Exchange state
  const [exchangeText, setExchangeText] = useState('');
  const [exchangeImage, setExchangeImage] = useState(null);
  const [exchangePreview, setExchangePreview] = useState(null);

  // Borrow "what you want to offer" state
  const [borrowOfferText, setBorrowOfferText] = useState('');
  const [borrowOfferImage, setBorrowOfferImage] = useState(null);
  const [borrowOfferPreview, setBorrowOfferPreview] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      try {
        const res = await itemService.getById(id);
        setItem(res.data.item);
      } catch {
        const mockItem = MOCK_ITEMS.find((i) => i._id === id);
        setItem(mockItem || null);
      }
      setLoading(false);
    };
    fetchItem();
  }, [id]);

  // Calculate number of days selected
  const daysSelected = useMemo(() => {
    if (!dateFrom || !dateTo) return 0;
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    const diffMs = to - from;
    return diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0;
  }, [dateFrom, dateTo]);

  if (loading) {
    return (
      <div className="sc-container sc-section text-center" style={{ paddingTop: 'var(--space-8)', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-border" style={{ color: 'var(--primary-500)' }} role="status"><span className="visually-hidden">Loading...</span></div>
        <p className="mt-3" style={{ color: 'var(--text-tertiary)' }}>Loading item details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="sc-container sc-section text-center" style={{ paddingTop: 'var(--space-8)', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <i className="bi bi-emoji-frown d-block mb-3" style={{ fontSize: '4rem', color: 'var(--text-tertiary)' }}></i>
        <h3 className="fw-bold mb-2">Item Not Found</h3>
        <p style={{ color: 'var(--text-tertiary)' }} className="mb-4">This item doesn&apos;t exist or has been removed.</p>
        <Link to="/browse" className="sc-btn sc-btn-primary"><i className="bi bi-arrow-left me-2"></i>Back to Browse</Link>
      </div>
    );
  }

  const { title, description, price = 0, mrp = 0, deposit = 0, rentPerDay = 0, borrowPerDay = 0, sharePerDay = 0, wantInReturn = '', images = [], transactionType, category, condition, location, owner, createdAt } = item;
  const imgSrc = images[selectedImageIdx] || images[0] || placeholderImage(800, 600);
  const typeInfo = TYPE_INFO[transactionType] || TYPE_INFO.buy;

  // Determine if deposit applies
  const hasDeposit = ['rent', 'borrow', 'share'].includes(transactionType);
  const hasDatePicker = ['rent', 'borrow', 'share'].includes(transactionType);
  const isExchange = transactionType === 'exchange';
  const isDonate = transactionType === 'donate';
  const isBorrow = transactionType === 'borrow';
  const showMrp = !isExchange && !isDonate && mrp > 0;
  const showPrice = !isExchange && !isDonate;
  const perDayRate = transactionType === 'rent' ? rentPerDay : transactionType === 'borrow' ? borrowPerDay : transactionType === 'share' ? sharePerDay : 0;

  // Price calculations
  const basePrice = hasDatePicker && perDayRate > 0 && daysSelected > 0
    ? perDayRate * daysSelected
    : (isExchange || isDonate) ? 0 : price;
  const platformFee = Math.round(basePrice * 0.02);
  const deliveryFee = basePrice > 500 ? 0 : 49;
  const gst = Math.round(basePrice * 0.05);
  const depositAmount = hasDeposit ? (deposit || mrp || 0) : 0;
  const totalWithoutDeposit = basePrice + platformFee + deliveryFee + gst;
  const grandTotal = totalWithoutDeposit + depositAmount;

  // For donate: charge only platform + delivery + GST on zero base
  const donatePlatformFee = 10;
  const donateDeliveryFee = 49;
  const donateGst = Math.round((donatePlatformFee + donateDeliveryFee) * 0.05);
  const donateTotal = donatePlatformFee + donateDeliveryFee + donateGst;

  const handleContactSeller = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setContacted(true);
    toast.success('Redirecting to chat...');
    setTimeout(() => navigate('/chat', { state: { recipient: owner, item } }), 800);
  };

  const handlePrimaryAction = () => {
    if (!isAuthenticated) { toast.warning('Please login first'); navigate('/login'); return; }

    if (hasDatePicker && (!dateFrom || !dateTo || daysSelected <= 0)) {
      toast.warning('Please select valid dates');
      return;
    }

    if (isExchange && !exchangeText.trim()) {
      toast.warning('Please describe what you want to exchange');
      return;
    }

    toast.info('Proceeding to checkout...');
    navigate(`/checkout?item=${id}&from=${dateFrom}&to=${dateTo}&days=${daysSelected}`);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.warning('Please login first'); navigate('/login'); return; }
    try { await orderService.addToCart(id); setInCart(true); toast.success('Added to cart! 🛒'); }
    catch (e) { toast.error(e.response?.data?.error || 'Failed to add to cart'); }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.warning('Please login first'); navigate('/login'); return; }
    try {
      if (saved) { await orderService.removeFromWishlist(id); setSaved(false); toast.info('Removed from wishlist'); }
      else { await orderService.addToWishlist(id); setSaved(true); toast.success('Added to wishlist! ❤️'); }
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  const handleExchangeImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setExchangeImage(file);
      setExchangePreview(URL.createObjectURL(file));
    }
  };

  const handleBorrowOfferImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBorrowOfferImage(file);
      setBorrowOfferPreview(URL.createObjectURL(file));
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="sc-container sc-section" style={{ paddingTop: 'var(--space-8)' }}>
      <nav className="mb-4" style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
        <Link to="/browse" style={{ color: 'var(--primary-500)', textDecoration: 'none' }}>Browse</Link>
        <span className="mx-2">/</span><span>{category}</span>
        <span className="mx-2">/</span><span style={{ color: 'var(--text-primary)' }}>{title}</span>
      </nav>

      <div className="fade-in">
        <div className="row g-4">
          {/* Gallery */}
          <div className="col-lg-7">
            <div className="item-detail-gallery">
              <img src={imgSrc} alt={title} onError={(e) => { e.target.src = placeholderImage(800, 600); }} />
            </div>
            {images.length > 1 && (
              <div className="d-flex gap-2 mt-3">
                {images.slice(0, 5).map((img, i) => (
                  <div key={i} onClick={() => setSelectedImageIdx(i)}
                    style={{ width: 80, height: 60, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: `2px solid ${i === selectedImageIdx ? 'var(--primary-500)' : 'var(--border-color)'}`, cursor: 'pointer', opacity: i === selectedImageIdx ? 1 : 0.7, transition: 'all 0.2s ease' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}

            {/* Map */}
            {location?.coordinates?.coordinates && (
              <div className="mt-4 sc-card">
                <h6 className="fw-bold mb-2"><i className="bi bi-geo-alt me-1" style={{ color: 'var(--primary-500)' }}></i>Seller Location</h6>
                <div style={{ height: 250, borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  <MapContainer center={[location.coordinates.coordinates[1], location.coordinates.coordinates[0]]} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={[location.coordinates.coordinates[1], location.coordinates.coordinates[0]]}>
                      <Popup>Seller is located near here</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className="col-lg-5">
            <div className="sc-card">
              {/* Type Badge */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="sc-badge" style={{ background: getTypeColor(transactionType), color: '#fff', textTransform: 'capitalize', padding: '6px 14px', fontSize: '0.85rem' }}>
                  <i className={`bi ${typeInfo.icon} me-1`}></i>{typeInfo.label}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginBottom: '12px' }}>{typeInfo.desc}</p>

              <h2 className="mb-2">{title}</h2>

              {/* Price Display */}
              <div className="mb-3">
                {showMrp && mrp > 0 && mrp !== price && (
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>
                    MRP: <span style={{ textDecoration: 'line-through' }}>{formatPrice(mrp)}</span>
                    {mrp > price && price > 0 && (
                      <span className="ms-2 fw-semibold" style={{ color: '#10b981', fontSize: '0.82rem' }}>
                        {Math.round(((mrp - price) / mrp) * 100)}% off
                      </span>
                    )}
                  </div>
                )}
                {showPrice && (
                  <h3 className="mb-0" style={{ color: 'var(--primary-500)' }}>
                    {hasDatePicker && perDayRate > 0
                      ? `${formatPrice(perDayRate)} / day`
                      : formatPrice(price)}
                  </h3>
                )}
                {isExchange && <h3 className="mb-0" style={{ color: 'var(--primary-500)' }}>Free (Exchange)</h3>}
                {isDonate && <h3 className="mb-0" style={{ color: 'var(--primary-500)' }}>Free (Donation)</h3>}
              </div>

              <div className="d-flex flex-wrap gap-2 mb-4">
                <span className="sc-chip"><i className="bi bi-tag"></i> {category}</span>
                <span className="sc-chip"><i className="bi bi-check-circle"></i> {condition?.replace('_', ' ')}</span>
                <span className="sc-chip"><i className="bi bi-clock"></i> {timeAgo(createdAt)}</span>
              </div>

              <hr style={{ borderColor: 'var(--border-color)' }} />

              <h6 className="fw-bold mb-2">Description</h6>
              <p style={{ lineHeight: 1.7 }}>{description}</p>

              {/* Exchange — "What they want" */}
              {isExchange && wantInReturn && (
                <div className="p-3 rounded-3 mb-3" style={{ background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.2)' }}>
                  <h6 className="fw-bold mb-1" style={{ color: '#EC4899' }}><i className="bi bi-arrow-left-right me-1"></i>What they want in return</h6>
                  <p className="mb-0" style={{ fontSize: '0.9rem' }}>{wantInReturn}</p>
                </div>
              )}

              <hr style={{ borderColor: 'var(--border-color)' }} />

              {/* Date Picker for rent/borrow/share */}
              {hasDatePicker && (
                <div className="mb-4">
                  <h6 className="fw-bold mb-2"><i className="bi bi-calendar-range me-1" style={{ color: 'var(--primary-500)' }}></i>Select Duration</h6>
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>From</label>
                      <input type="date" className="sc-input" value={dateFrom} min={todayStr}
                        onChange={(e) => { setDateFrom(e.target.value); if (dateTo && e.target.value >= dateTo) setDateTo(''); }} />
                    </div>
                    <div className="col-6">
                      <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>To</label>
                      <input type="date" className="sc-input" value={dateTo} min={dateFrom || todayStr}
                        onChange={(e) => setDateTo(e.target.value)} />
                    </div>
                  </div>
                  {daysSelected > 0 && (
                    <div className="mt-2 p-2 rounded-3 d-flex justify-content-between" style={{ background: 'var(--primary-50)', fontSize: '0.85rem' }}>
                      <span><i className="bi bi-calendar-check me-1"></i>{daysSelected} day{daysSelected > 1 ? 's' : ''} selected</span>
                      {perDayRate > 0 && <span className="fw-bold" style={{ color: 'var(--primary-600)' }}>{formatPrice(perDayRate * daysSelected)}</span>}
                    </div>
                  )}
                  <hr style={{ borderColor: 'var(--border-color)' }} />
                </div>
              )}

              {/* Deposit Info for rent/borrow/share */}
              {hasDeposit && depositAmount > 0 && (
                <div className="mb-3 p-3 rounded-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <i className="bi bi-shield-check" style={{ color: '#F59E0B', fontSize: '1.2rem' }}></i>
                    <h6 className="fw-bold mb-0" style={{ color: '#F59E0B' }}>Security Deposit</h6>
                  </div>
                  <p className="mb-1" style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    A refundable deposit of <strong>{formatPrice(depositAmount)}</strong> (MRP value) will be collected. This will be returned in full if the item is returned undamaged before the deadline.
                  </p>
                  <small style={{ color: 'var(--text-tertiary)' }}>If the item is damaged/broken, the deposit amount will be deducted accordingly.</small>
                </div>
              )}

              {/* Exchange — Your item input */}
              {isExchange && (
                <div className="mb-3">
                  <h6 className="fw-bold mb-2"><i className="bi bi-repeat me-1" style={{ color: '#EC4899' }}></i>What do you want to exchange?</h6>
                  <textarea className="sc-input mb-2" rows={2} placeholder="Describe the item you want to exchange..."
                    value={exchangeText} onChange={(e) => setExchangeText(e.target.value)} />
                  <div className="d-flex align-items-center gap-2">
                    <label className="sc-btn sc-btn-outline sc-btn-sm" style={{ cursor: 'pointer' }}>
                      <i className="bi bi-image me-1"></i>Add Photo (Optional)
                      <input type="file" className="d-none" accept="image/*" onChange={handleExchangeImageChange} />
                    </label>
                    {exchangePreview && (
                      <div style={{ width: 50, height: 50, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                        <img src={exchangePreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>
                  <hr style={{ borderColor: 'var(--border-color)' }} />
                </div>
              )}

              {/* Borrow — What you want to offer */}
              {isBorrow && (
                <div className="mb-3">
                  <h6 className="fw-bold mb-2"><i className="bi bi-chat-left-text me-1" style={{ color: '#3B82F6' }}></i>What do you want to offer? (Optional)</h6>
                  <textarea className="sc-input mb-2" rows={2} placeholder="E.g., I'll take good care of it, happy to leave a review..."
                    value={borrowOfferText} onChange={(e) => setBorrowOfferText(e.target.value)} />
                  <div className="d-flex align-items-center gap-2">
                    <label className="sc-btn sc-btn-outline sc-btn-sm" style={{ cursor: 'pointer' }}>
                      <i className="bi bi-image me-1"></i>Add Photo (Optional)
                      <input type="file" className="d-none" accept="image/*" onChange={handleBorrowOfferImageChange} />
                    </label>
                    {borrowOfferPreview && (
                      <div style={{ width: 50, height: 50, borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                        <img src={borrowOfferPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>
                  <hr style={{ borderColor: 'var(--border-color)' }} />
                </div>
              )}

              {/* Price Breakdown */}
              <div className="mb-4 p-3 rounded-3" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)' }}>
                <h6 className="fw-bold mb-3"><i className="bi bi-receipt me-1" style={{ color: 'var(--primary-500)' }}></i>Price Breakdown</h6>
                {isDonate ? (
                  <>
                    <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem' }}><span>Item Price</span><span style={{ color: 'var(--primary-500)' }}>Free</span></div>
                    <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem' }}><span>Platform Fee</span><span>{formatPrice(donatePlatformFee)}</span></div>
                    <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem' }}><span>Delivery Fee</span><span>{formatPrice(donateDeliveryFee)}</span></div>
                    <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem' }}><span>GST & Taxes (5%)</span><span>{formatPrice(donateGst)}</span></div>
                    <hr style={{ borderColor: 'var(--border-color)' }} />
                    <div className="d-flex justify-content-between fw-bold fs-6"><span>Total</span><span style={{ color: 'var(--primary-500)' }}>{formatPrice(donateTotal)}</span></div>
                  </>
                ) : isExchange ? (
                  <>
                    <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem' }}><span>Exchange</span><span style={{ color: 'var(--primary-500)' }}>Free</span></div>
                    <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem' }}><span>Platform Fee</span><span>{formatPrice(10)}</span></div>
                    <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem' }}><span>Delivery Fee</span><span>{formatPrice(49)}</span></div>
                    <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem' }}><span>GST & Taxes (5%)</span><span>{formatPrice(Math.round(59 * 0.05))}</span></div>
                    <hr style={{ borderColor: 'var(--border-color)' }} />
                    <div className="d-flex justify-content-between fw-bold fs-6"><span>Total</span><span style={{ color: 'var(--primary-500)' }}>{formatPrice(59 + Math.round(59 * 0.05))}</span></div>
                  </>
                ) : (
                  <>
                    {hasDatePicker && perDayRate > 0 ? (
                      <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem' }}>
                        <span>{formatPrice(perDayRate)} × {daysSelected || '—'} day{daysSelected !== 1 ? 's' : ''}</span>
                        <span>{daysSelected > 0 ? formatPrice(perDayRate * daysSelected) : '—'}</span>
                      </div>
                    ) : (
                      <>
                        {showMrp && mrp > 0 && mrp !== price && (
                          <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                            <span>MRP</span><span style={{ textDecoration: 'line-through' }}>{formatPrice(mrp)}</span>
                          </div>
                        )}
                        <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem' }}><span>Price</span><span>{formatPrice(price)}</span></div>
                      </>
                    )}
                    <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem' }}><span>Platform Fee (2%)</span><span>{formatPrice(platformFee)}</span></div>
                    <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem' }}>
                      <span>Delivery Fee</span>
                      <span style={{ color: deliveryFee === 0 ? 'var(--primary-500)' : 'inherit' }}>{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem' }}><span>GST & Taxes (5%)</span><span>{formatPrice(gst)}</span></div>
                    {hasDeposit && depositAmount > 0 && (
                      <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem', color: '#F59E0B' }}>
                        <span>Security Deposit (Refundable)</span><span>{formatPrice(depositAmount)}</span>
                      </div>
                    )}
                    <hr style={{ borderColor: 'var(--border-color)' }} />
                    <div className="d-flex justify-content-between fw-bold fs-6">
                      <span>Total {hasDeposit ? '(incl. deposit)' : ''}</span>
                      <span style={{ color: 'var(--primary-500)' }}>{daysSelected > 0 || !hasDatePicker ? formatPrice(hasDeposit ? grandTotal : totalWithoutDeposit) : '—'}</span>
                    </div>
                    <small style={{ color: 'var(--text-tertiary)' }}>Incl. of all taxes and charges</small>
                  </>
                )}
              </div>

              {/* Owner */}
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, background: 'var(--primary-100)', color: 'var(--primary-600)', fontWeight: 700, fontSize: '1.1rem' }}>
                  {owner?.avatar ? <img src={owner.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : owner?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h6 className="mb-0 fw-bold">{owner?.name || 'Unknown'}</h6>
                  <small style={{ color: 'var(--text-tertiary)' }}><i className="bi bi-geo-alt me-1"></i>{location?.city || 'Unknown'}</small>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-grid gap-2">
                {isAuthenticated && user?._id === owner?._id ? (
                  <div className="p-3 text-center rounded-3 bg-light border">
                    <i className="bi bi-info-circle me-2 text-primary"></i>
                    <span className="fw-semibold text-secondary">This is your own listing</span>
                    <Link to={`/edit/${id}`} className="d-block mt-2 text-decoration-none">Edit Listing</Link>
                  </div>
                ) : (
                  <>
                    {/* Primary Action */}
                    <button className="sc-btn sc-btn-primary sc-btn-lg" onClick={handlePrimaryAction}
                      style={{ background: getTypeColor(transactionType), borderColor: getTypeColor(transactionType) }}>
                      <i className={`bi ${typeInfo.actionIcon} me-2`}></i>{typeInfo.actionLabel}
                    </button>

                    {/* Add to Cart — only for buy/sell */}
                    {(transactionType === 'buy' || transactionType === 'sell') && (
                      <button className={`sc-btn ${inCart ? 'sc-btn-outline' : 'sc-btn-primary'} sc-btn-lg`} onClick={handleAddToCart} disabled={inCart}>
                        <i className={`bi ${inCart ? 'bi-cart-check-fill' : 'bi-cart-plus'} me-2`}></i>{inCart ? 'In Cart' : 'Add to Cart'}
                      </button>
                    )}

                    <div className="d-flex gap-2">
                      <button className={`sc-btn ${saved ? 'sc-btn-primary' : 'sc-btn-outline'} flex-grow-1`} onClick={handleWishlist}>
                        <i className={`bi ${saved ? 'bi-heart-fill' : 'bi-heart'} me-1`}></i>{saved ? 'Wishlisted' : 'Wishlist'}
                      </button>
                      <button className="sc-btn sc-btn-outline flex-grow-1" onClick={handleContactSeller} disabled={contacted}>
                        <i className="bi bi-chat-dots me-1"></i>{contacted ? 'Redirecting...' : 'Contact'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
