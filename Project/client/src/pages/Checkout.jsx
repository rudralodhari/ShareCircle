import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import itemService from '../services/itemService';
import orderService from '../services/orderService';
import { formatPrice, placeholderImage } from '../utils/helpers';

const PAYMENT_METHODS = [
  { key: 'upi', label: 'UPI', icon: 'bi-phone', desc: 'Google Pay, PhonePe, Paytm' },
  { key: 'credit_card', label: 'Credit Card', icon: 'bi-credit-card', desc: 'Visa, Mastercard, Rupay' },
  { key: 'debit_card', label: 'Debit Card / ATM', icon: 'bi-credit-card-2-back', desc: 'All banks supported' },
  { key: 'emi', label: 'EMI', icon: 'bi-calendar2-range', desc: 'No cost EMI available' },
  { key: 'net_banking', label: 'Net Banking', icon: 'bi-bank', desc: 'All major banks' },
  { key: 'cod', label: 'Cash on Delivery', icon: 'bi-cash-stack', desc: 'Pay when you receive' },
  { key: 'gift_card', label: 'Gift Card', icon: 'bi-gift', desc: 'Apply gift code for discount' },
];

export default function Checkout() {
  const [params] = useSearchParams();
  const itemId = params.get('item');
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(1); // 1=Address, 2=Summary, 3=Payment
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [payMethod, setPayMethod] = useState('cod');
  const [giftCode, setGiftCode] = useState('');
  const [giftApplied, setGiftApplied] = useState(false);
  const [giftDiscountPercent, setGiftDiscountPercent] = useState(0);
  const [otherLabel, setOtherLabel] = useState('');

  // Auto-fill address from user profile
  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    line1: user?.location?.address || '',
    line2: '',
    city: user?.location?.city || '',
    state: user?.location?.state || '',
    country: user?.location?.country || 'India',
    zipcode: user?.location?.zipcode || '',
    type: 'home',
  });

  // Update address when user data loads
  useEffect(() => {
    if (user) {
      setAddress(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        phone: prev.phone || user.phone || '',
        line1: prev.line1 || user.location?.address || '',
        city: prev.city || user.location?.city || '',
        state: prev.state || user.location?.state || '',
        country: prev.country || user.location?.country || 'India',
        zipcode: prev.zipcode || user.location?.zipcode || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!itemId) { navigate('/browse'); return; }
    const fetch = async () => {
      try { const res = await itemService.getById(itemId); setItem(res.data.item); }
      catch { toast.error('Item not found'); navigate('/browse'); }
      setLoading(false);
    };
    fetch();
  }, [itemId, navigate, toast]);

  if (loading || !item) return <div className="sc-container sc-section text-center py-5"><div className="spinner-border" style={{ color: 'var(--primary-500)' }}></div></div>;

  const txType = item.transactionType;
  const hasDeposit = ['rent', 'borrow', 'share'].includes(txType);
  const isExchange = txType === 'exchange';
  const isDonate = txType === 'donate';

  // Get days from URL params
  const days = parseInt(params.get('days')) || 0;
  const perDayRate = txType === 'rent' ? (item.rentPerDay || 0) : txType === 'borrow' ? (item.borrowPerDay || 0) : txType === 'share' ? (item.sharePerDay || 0) : 0;

  const basePrice = (perDayRate > 0 && days > 0)
    ? perDayRate * days
    : (isExchange || isDonate) ? 0 : (item.price || 0);

  const platformFee = isDonate || isExchange ? 10 : Math.round(basePrice * 0.02);
  const deliveryFee = basePrice > 500 ? 0 : 49;
  const tax = isDonate || isExchange
    ? Math.round((platformFee + deliveryFee) * 0.05)
    : Math.round(basePrice * 0.05);
  const depositAmount = hasDeposit ? (item.deposit || item.mrp || 0) : 0;

  let discount = 0;
  if (giftApplied && giftDiscountPercent > 0) {
    discount = Math.round(basePrice * (giftDiscountPercent / 100));
  }

  const subtotal = basePrice + platformFee + deliveryFee + tax - discount;
  const total = Math.max(0, subtotal + depositAmount);

  const handleApplyGift = () => {
    const codeObj = user?.giftCodes?.find(gc => gc.code === giftCode.toUpperCase() && !gc.isUsed);
    if (codeObj) {
      setGiftCode(giftCode.toUpperCase());
      setGiftDiscountPercent(codeObj.discountPercentage);
      setGiftApplied(true);
      toast.success(`Gift code applied! You get ${codeObj.discountPercentage}% off! 🎁`);
    } else {
      toast.error('Invalid or already used gift code.');
    }
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      await orderService.createOrder({ 
        itemId: item._id, 
        address: { ...address, otherLabel }, 
        paymentMethod: payMethod, 
        giftCode: giftApplied ? giftCode : '',
        days: hasDeposit ? days : 0 // Pass days so order logic can know duration
      });
      if (giftApplied && giftCode) {
        updateUser({
          giftCodes: user.giftCodes.map(gc => gc.code === giftCode.toUpperCase() ? { ...gc, isUsed: true } : gc)
        });
      }
      toast.success('🎉 Order placed successfully!');
      navigate('/my-orders');
    } catch (err) { toast.error(err.response?.data?.error || 'Order failed'); }
    setPlacing(false);
  };

  // Step indicators
  const steps = [
    { num: 1, label: 'Address', icon: 'bi-geo-alt' },
    { num: 2, label: 'Summary', icon: 'bi-receipt' },
    { num: 3, label: 'Payment', icon: 'bi-credit-card' },
  ];

  return (
    <div className="sc-container sc-section fade-in" style={{ paddingTop: 'var(--space-8)', maxWidth: 900, margin: '0 auto' }}>
      {/* Step indicator */}
      <div className="d-flex justify-content-center gap-2 mb-5">
        {steps.map((s, i) => (
          <div key={s.num} className="d-flex align-items-center">
            <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
              style={{ background: step >= s.num ? 'var(--primary-500)' : 'var(--bg-surface-2)', color: step >= s.num ? '#fff' : 'var(--text-tertiary)', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.3s' }}>
              <i className={`bi ${s.icon}`}></i>{s.label}
            </div>
            {i < steps.length - 1 && <div style={{ width: 40, height: 2, background: step > s.num ? 'var(--primary-500)' : 'var(--border-color)', margin: '0 4px' }}></div>}
          </div>
        ))}
      </div>

      {/* Step 1: Address */}
      {step === 1 && (
        <div className="sc-card">
          <h4 className="fw-bold mb-4"><i className="bi bi-geo-alt me-2" style={{ color: 'var(--primary-500)' }}></i>Delivery Address</h4>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Full Name</label><input className="sc-input" value={address.name} onChange={(e) => setAddress({...address, name: e.target.value})} /></div>
            <div className="col-md-6"><label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Phone Number</label><input className="sc-input" value={address.phone} onChange={(e) => setAddress({...address, phone: e.target.value})} /></div>
            <div className="col-12"><label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Address Line 1</label><input className="sc-input" value={address.line1} onChange={(e) => setAddress({...address, line1: e.target.value})} placeholder="House No, Street, Area" /></div>
            <div className="col-12"><label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Address Line 2 (optional)</label><input className="sc-input" value={address.line2} onChange={(e) => setAddress({...address, line2: e.target.value})} placeholder="Landmark" /></div>
            <div className="col-md-4"><label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>City</label><input className="sc-input" value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} /></div>
            <div className="col-md-4"><label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>State</label><input className="sc-input" value={address.state} onChange={(e) => setAddress({...address, state: e.target.value})} /></div>
            <div className="col-md-4"><label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>PIN Code</label><input className="sc-input" value={address.zipcode} onChange={(e) => setAddress({...address, zipcode: e.target.value})} /></div>
            <div className="col-12">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Address Type</label>
              <div className="d-flex gap-2 flex-wrap">
                {['home', 'office', 'other'].map((t) => (
                  <button key={t} className={`sc-chip ${address.type === t ? 'active' : ''}`} onClick={() => setAddress({...address, type: t})} style={{ textTransform: 'capitalize' }}>
                    <i className={`bi ${t === 'home' ? 'bi-house' : t === 'office' ? 'bi-building' : 'bi-pin-map'}`}></i> {t}
                  </button>
                ))}
              </div>
              {address.type === 'other' && (
                <input className="sc-input mt-2" placeholder="Enter address label (e.g., Hostel, Relative's home...)"
                  value={otherLabel} onChange={(e) => setOtherLabel(e.target.value)} />
              )}
            </div>
          </div>
          <div className="mt-4 text-end">
            <button className="sc-btn sc-btn-primary sc-btn-lg" onClick={() => {
              if (!address.name || !address.phone || !address.line1 || !address.city || !address.zipcode) { toast.warning('Please fill all required address fields'); return; }
              if (address.type === 'other' && !otherLabel.trim()) { toast.warning('Please enter a label for your address type'); return; }
              setStep(2);
            }}><i className="bi bi-arrow-right me-2"></i>Continue</button>
          </div>
        </div>
      )}

      {/* Step 2: Order Summary */}
      {step === 2 && (
        <div className="sc-card">
          <h4 className="fw-bold mb-4"><i className="bi bi-receipt me-2" style={{ color: 'var(--primary-500)' }}></i>Order Summary</h4>
          {/* Deliver to */}
          <div className="p-3 rounded-3 mb-4" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="fw-bold mb-0">Deliver to:</h6>
              <span className="sc-badge sc-badge-primary" style={{ textTransform: 'capitalize' }}>{address.type === 'other' ? otherLabel || 'Other' : address.type}</span>
            </div>
            <div className="fw-semibold">{address.name}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{address.line1}{address.line2 ? ', ' + address.line2 : ''}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{address.city}, {address.state} - {address.zipcode}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}><i className="bi bi-telephone me-1"></i>{address.phone}</div>
          </div>
          {/* Product */}
          <div className="d-flex gap-3 p-3 rounded-3 mb-4" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)' }}>
            <img src={item.images?.[0] || placeholderImage(100, 100)} alt={item.title} style={{ width: 80, height: 80, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
              onError={(e) => { e.target.src = placeholderImage(100, 100); }} />
            <div>
              <div className="fw-bold">{item.title}</div>
              <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>{item.category} · {item.condition} · <span style={{ textTransform: 'capitalize' }}>{txType}</span></div>
              {item.mrp > 0 && item.mrp !== item.price && !isExchange && !isDonate && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>MRP: <span style={{ textDecoration: 'line-through' }}>{formatPrice(item.mrp)}</span></div>
              )}
              <div className="fw-bold mt-1" style={{ color: 'var(--primary-500)' }}>
                {perDayRate > 0 && days > 0 ? `${formatPrice(perDayRate)}/day × ${days} days = ${formatPrice(basePrice)}` : formatPrice(basePrice)}
              </div>
            </div>
          </div>
          {/* Price Breakdown */}
          <div className="p-3 rounded-3" style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)' }}>
            <h6 className="fw-bold mb-3">Price Details</h6>
            {perDayRate > 0 && days > 0 ? (
              <div className="d-flex justify-content-between mb-2"><span>{formatPrice(perDayRate)} × {days} day{days > 1 ? 's' : ''}</span><span>{formatPrice(basePrice)}</span></div>
            ) : (
              <>
                {item.mrp > 0 && item.mrp !== basePrice && !isExchange && !isDonate && (
                  <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                    <span>MRP</span><span style={{ textDecoration: 'line-through' }}>{formatPrice(item.mrp)}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-2"><span>{isExchange || isDonate ? 'Item Price' : 'Price'}</span><span>{isExchange || isDonate ? 'Free' : formatPrice(basePrice)}</span></div>
              </>
            )}
            <div className="d-flex justify-content-between mb-2"><span>Platform Fee {isDonate || isExchange ? '' : '(2%)'}</span><span>{formatPrice(platformFee)}</span></div>
            <div className="d-flex justify-content-between mb-2"><span>Delivery Fee</span><span style={{ color: deliveryFee === 0 ? 'var(--primary-500)' : 'inherit' }}>{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span></div>
            <div className="d-flex justify-content-between mb-2"><span>Tax/GST (5%)</span><span>{formatPrice(tax)}</span></div>
            {hasDeposit && depositAmount > 0 && (
              <div className="d-flex justify-content-between mb-2" style={{ color: '#F59E0B' }}>
                <span><i className="bi bi-shield-check me-1"></i>Security Deposit (Refundable)</span><span>{formatPrice(depositAmount)}</span>
              </div>
            )}
            {giftApplied && discount > 0 && <div className="d-flex justify-content-between mb-2" style={{ color: 'var(--primary-500)' }}><span>Gift Discount</span><span>-{formatPrice(discount)}</span></div>}
            <hr style={{ borderColor: 'var(--border-color)' }} />
            <div className="d-flex justify-content-between fw-bold fs-5"><span>Total {hasDeposit ? '(incl. deposit)' : ''}</span><span style={{ color: 'var(--primary-500)' }}>{formatPrice(total)}</span></div>
            <small style={{ color: 'var(--text-tertiary)' }}>Incl. of all taxes and charges{hasDeposit ? '. Deposit is refundable on safe return.' : ''}</small>
          </div>
          {/* Gift Card */}
          <div className="mt-3 d-flex gap-2">
            <input className="sc-input" placeholder="Enter gift code" value={giftCode} onChange={(e) => setGiftCode(e.target.value)} disabled={giftApplied} style={{ flex: 1 }} />
            <button className="sc-btn sc-btn-outline" onClick={handleApplyGift} disabled={giftApplied || !giftCode}>
              {giftApplied ? '✓ Applied' : 'Apply'}
            </button>
          </div>
          
          {user?.giftCodes && user.giftCodes.filter(gc => !gc.isUsed).length > 0 && !giftApplied && (
            <div className="mt-2 d-flex flex-wrap gap-2">
              <small style={{ color: 'var(--text-tertiary)' }}>Available Codes:</small>
              {user.giftCodes.filter(gc => !gc.isUsed).map((gc, idx) => (
                <span key={idx} className="sc-badge" style={{ background: 'var(--primary-100)', color: 'var(--primary-600)', cursor: 'pointer' }} onClick={() => setGiftCode(gc.code)}>
                  {gc.code} ({gc.discountPercentage}%)
                </span>
              ))}
            </div>
          )}
          <div className="mt-4 d-flex justify-content-between">
            <button className="sc-btn sc-btn-ghost" onClick={() => setStep(1)}><i className="bi bi-arrow-left me-2"></i>Back</button>
            <button className="sc-btn sc-btn-primary sc-btn-lg" onClick={() => setStep(3)}><i className="bi bi-arrow-right me-2"></i>Continue to Payment</button>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 3 && (
        <div className="sc-card">
          <h4 className="fw-bold mb-4"><i className="bi bi-credit-card me-2" style={{ color: 'var(--primary-500)' }}></i>Payment Method</h4>
          <div className="d-flex flex-column gap-2 mb-4">
            {PAYMENT_METHODS.map((m) => (
              <button key={m.key} className="d-flex align-items-center gap-3 p-3 rounded-3 text-start w-100"
                onClick={() => setPayMethod(m.key)}
                style={{ background: payMethod === m.key ? 'var(--primary-50)' : 'var(--bg-surface-2)', border: `2px solid ${payMethod === m.key ? 'var(--primary-500)' : 'var(--border-color)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                <i className={`bi ${m.icon} fs-4`} style={{ color: payMethod === m.key ? 'var(--primary-500)' : 'var(--text-tertiary)' }}></i>
                <div>
                  <div className="fw-semibold" style={{ color: 'var(--text-primary)' }}>{m.label}</div>
                  <small style={{ color: 'var(--text-tertiary)' }}>{m.desc}</small>
                </div>
                {payMethod === m.key && <i className="bi bi-check-circle-fill ms-auto" style={{ color: 'var(--primary-500)', fontSize: '1.2rem' }}></i>}
              </button>
            ))}
          </div>
          {/* Final Price */}
          <div className="p-3 rounded-3 mb-4 d-flex justify-content-between align-items-center" style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-200)' }}>
            <div>
              <small style={{ color: 'var(--text-tertiary)' }}>Total Amount {hasDeposit ? '(incl. refundable deposit)' : ''}</small>
              <div className="fw-bold fs-4" style={{ color: 'var(--primary-600)' }}>{formatPrice(total)}</div>
              <small style={{ color: 'var(--text-tertiary)' }}>
                {hasDeposit && depositAmount > 0 && <>Deposit: {formatPrice(depositAmount)} (refundable) · </>}
                Incl. all taxes & charges
              </small>
            </div>
            <i className="bi bi-shield-check fs-2" style={{ color: 'var(--primary-400)' }}></i>
          </div>
          <div className="d-flex justify-content-between">
            <button className="sc-btn sc-btn-ghost" onClick={() => setStep(2)}><i className="bi bi-arrow-left me-2"></i>Back</button>
            <button className="sc-btn sc-btn-primary sc-btn-lg" onClick={handlePlaceOrder} disabled={placing}>
              {placing ? <><span className="spinner-border spinner-border-sm me-2"></span>Placing Order...</> : <><i className="bi bi-bag-check me-2"></i>Place Order</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
