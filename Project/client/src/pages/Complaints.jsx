import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import complaintService from '../services/complaintService';

export default function Complaints() {
  const [form, setForm] = useState({ title: '', againstUser: '', reason: '', details: '' });
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.reason) {
      toast.warning('Please fill in required fields');
      return;
    }
    try {
      await complaintService.createComplaint({
        subject: form.title,
        againstUser: form.againstUser,
        category: form.reason,
        description: form.details,
      });
      toast.success('Complaint submitted to admins!');
      setTimeout(() => navigate('/browse'), 1000);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit complaint');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="p-4 fade-in" style={{ background: 'var(--bg-body)' }}>
        <div className="sc-card mx-auto" style={{ maxWidth: 600 }}>
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{ width: 64, height: 64, background: 'var(--danger-50)', color: 'var(--danger-500)', fontSize: '1.8rem' }}>
              <i className="bi bi-exclamation-octagon"></i>
            </div>
            <h2 className="fw-bold">File a Complaint</h2>
            <p className="text-secondary">Dispute a transaction or report a user to the ShareCircle admins.</p>
          </div>

          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            <div>
               <label className="sc-label">Complaint Title *</label>
               <input className="sc-input" placeholder="E.g., Item not returned" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
            </div>
            <div>
               <label className="sc-label">Against User (Optional)</label>
               <input className="sc-input" placeholder="Name or email of the user" value={form.againstUser} onChange={e => setForm({...form, againstUser: e.target.value})} />
            </div>
            <div>
               <label className="sc-label">Reason *</label>
               <select className="sc-input" value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} required>
                 <option value="">Select a reason</option>
                 <option value="item_damaged">Item Damaged / Not as Described</option>
                 <option value="late_return">Late or No Return</option>
                 <option value="deposit_issue">Deposit Refund Issue</option>
                 <option value="fraud">Fraudulent Listing</option>
                 <option value="harassment">Harassment or Abuse</option>
                 <option value="other">Other</option>
               </select>
            </div>
            <div>
               <label className="sc-label">Additional Details</label>
               <textarea className="sc-input" rows={4} placeholder="Please provide specific details about the incident..." value={form.details} onChange={e => setForm({...form, details: e.target.value})}></textarea>
            </div>
            <div className="mt-2">
               <button type="submit" className="sc-btn sc-btn-primary w-100 sc-btn-lg">Submit to Admin</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
