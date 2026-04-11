import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ToastContainer from './components/common/ToastContainer';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CompleteProfile from './pages/CompleteProfile';
import Browse from './pages/Browse';
import ItemDetails from './pages/ItemDetails';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import OrdersReceived from './pages/OrdersReceived';
import Profile from './pages/Profile';
import MyListings from './pages/MyListings';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Community from './pages/Community';
import Sustainability from './pages/Sustainability';
import About from './pages/About';
import Support from './pages/Support';
import NotFound from './pages/NotFound';

import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import Complaints from './pages/Complaints';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import ManageUsers from './pages/admin/ManageUsers';
import ManageListings from './pages/admin/ManageListings';
import Disputes from './pages/admin/Disputes';

import './App.css';

import useScrollReveal from './hooks/useScrollReveal';

function AppLayout({ children, hideFooter = false }) {
  useScrollReveal();
  return (
    <>
      <Navbar />
      <ToastContainer />
      <main className="main-content">{children}</main>
      {!hideFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <SocketProvider>
            <Router>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<AppLayout><Home /></AppLayout>} />
                <Route path="/login" element={<AppLayout><Login /></AppLayout>} />
                <Route path="/register" element={<AppLayout><Register /></AppLayout>} />
                <Route path="/browse" element={<AppLayout><Browse /></AppLayout>} />
                <Route path="/item/:id" element={<AppLayout><ItemDetails /></AppLayout>} />
                <Route path="/community" element={<AppLayout><Community /></AppLayout>} />
                <Route path="/sustainability" element={<AppLayout><Sustainability /></AppLayout>} />
                <Route path="/about" element={<AppLayout><About /></AppLayout>} />
                <Route path="/support" element={<AppLayout><Support /></AppLayout>} />
                <Route path="/privacy" element={<AppLayout><PrivacyPolicy /></AppLayout>} />
                <Route path="/terms" element={<AppLayout><TermsOfService /></AppLayout>} />
                <Route path="/cookies" element={<AppLayout><CookiePolicy /></AppLayout>} />
                <Route path="/complaints" element={<AppLayout hideFooter><ProtectedRoute><Complaints /></ProtectedRoute></AppLayout>} />

                {/* Protected routes */}
                <Route path="/complete-profile" element={<AppLayout><ProtectedRoute><CompleteProfile /></ProtectedRoute></AppLayout>} />
                <Route path="/cart" element={<AppLayout hideFooter><ProtectedRoute><Cart /></ProtectedRoute></AppLayout>} />
                <Route path="/wishlist" element={<AppLayout hideFooter><ProtectedRoute><Wishlist /></ProtectedRoute></AppLayout>} />
                <Route path="/checkout" element={<AppLayout hideFooter><ProtectedRoute><Checkout /></ProtectedRoute></AppLayout>} />
                <Route path="/my-orders" element={<AppLayout hideFooter><ProtectedRoute><MyOrders /></ProtectedRoute></AppLayout>} />
                <Route path="/orders-received" element={<AppLayout hideFooter><ProtectedRoute><OrdersReceived /></ProtectedRoute></AppLayout>} />
                <Route path="/create" element={<AppLayout><ProtectedRoute><CreateListing /></ProtectedRoute></AppLayout>} />
                <Route path="/edit/:id" element={<AppLayout hideFooter><ProtectedRoute><EditListing /></ProtectedRoute></AppLayout>} />
                <Route path="/profile" element={<AppLayout><ProtectedRoute><Profile /></ProtectedRoute></AppLayout>} />
                <Route path="/my-listings" element={<AppLayout hideFooter><ProtectedRoute><MyListings /></ProtectedRoute></AppLayout>} />
                <Route path="/dashboard" element={<AppLayout hideFooter><ProtectedRoute><Dashboard /></ProtectedRoute></AppLayout>} />
                <Route path="/chat" element={<AppLayout hideFooter><ProtectedRoute><Chat /></ProtectedRoute></AppLayout>} />

                {/* Admin routes */}
                <Route path="/admin/login" element={<AppLayout><AdminLogin /></AppLayout>} />
                <Route path="/admin" element={<AppLayout hideFooter><ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute></AppLayout>} />
                <Route path="/admin/users" element={<AppLayout hideFooter><ProtectedRoute adminOnly><ManageUsers /></ProtectedRoute></AppLayout>} />
                <Route path="/admin/listings" element={<AppLayout hideFooter><ProtectedRoute adminOnly><ManageListings /></ProtectedRoute></AppLayout>} />
                <Route path="/admin/disputes" element={<AppLayout hideFooter><ProtectedRoute adminOnly><Disputes /></ProtectedRoute></AppLayout>} />

                {/* 404 */}
                <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
              </Routes>
            </Router>
          </SocketProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
