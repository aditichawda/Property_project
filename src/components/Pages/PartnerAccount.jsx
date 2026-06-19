import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { safeJsonParse } from '../../utils/safeJsonParse';
import { clearAppStorage } from '../../utils/authStorage';
import Header2 from '../Common/Header2';
import Footer2 from '../Common/Footer2';
import SEO from '../Common/SEO';
import Banner from '../Elements/Banner';
import ProductDetailModal from '../Elements/ProductDetailModal';
import {
  fetchUserPropertyInquiries,
  fetchUserPropertyInquiryDetail,
  normalizePropertyInquiry,
} from '../../api/propertyInquiries';
import { getCurrentInquiryUserId } from '../../api/solarInquiry';

const bannerImg = require('./../../images/banner/10.jpg');
const bgimg2 = require('./../../images/background/cross-line2.png');
const QUOTATION_LIST_API = 'https://www.admin.infrioindia.com/api/v2/auth/product-inquery-get';
const THEME_PRIMARY = '#0f172a';

function formatAccountDate(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-IN');
}

function statusBadgeStyle(status) {
  const text = String(status || '').toLowerCase();
  if (text.includes('closed') || text.includes('converted')) {
    return {
      background: '#d1e7dd',
      color: '#0f5132',
      border: '1px solid #badbcc',
    };
  }
  if (text.includes('follow')) {
    return {
      background: '#cff4fc',
      color: '#055160',
      border: '1px solid #b6effb',
    };
  }
  if (text.includes('contact')) {
    return {
      background: '#fff3cd',
      color: '#664d03',
      border: '1px solid #ffecb5',
    };
  }
  return {
    background: '#e7f1ff',
    color: '#084298',
    border: '1px solid #b6d4fe',
  };
}

function mapInquiryItemToProduct(item) {
  if (!item) return null;
  const photos = Array.isArray(item.product_photos) && item.product_photos.length > 0
    ? item.product_photos
    : item.product_thumbnail_img
      ? [item.product_thumbnail_img]
      : [];
  return {
    id: item.product_id || item.id,
    title: item.name,
    price: item.price != null ? parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0 : null,
    images: photos,
    brand_name: item.brand_name || '',
    short_description: item.product_short_description || item.product_description || '',
    full_description: item.product_description || item.product_short_description || '',
    specifications: item.product_specification || []
  };
}

function formatPropertyDisplayPrice(value, fallbackValue) {
  const raw = value || fallbackValue;
  if (!raw) return 'N/A';
  const text = String(raw).trim();
  if (/₹|rs\.?|lac|lakh|cr|crore/i.test(text)) return text;
  const amount = Number(text.replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(amount) || amount <= 0) return text;
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${Number.isInteger(cr) ? cr : cr.toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    const lac = amount / 100000;
    return `₹${Number.isInteger(lac) ? lac : lac.toFixed(2)} Lac`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

const PartnerAccount = () => {
  const navigate = useNavigate();
  const [partnerData, setPartnerData] = useState(null);
  const [activeTab, setActiveTab] = useState('enquiries');
  const [availableTasks, setAvailableTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [availableError, setAvailableError] = useState(null);
  const [myTasksLoading, setMyTasksLoading] = useState(false);
  const [myTasksError, setMyTasksError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [quotations, setQuotations] = useState([]);
  const [quotationsLoading, setQuotationsLoading] = useState(false);
  const [quotationsError, setQuotationsError] = useState(null);
  const [expandedQuotationId, setExpandedQuotationId] = useState(null);
  const [selectedQuotationProduct, setSelectedQuotationProduct] = useState(null);
  const [propertyEnquiries, setPropertyEnquiries] = useState([]);
  const [propertyEnquiriesLoading, setPropertyEnquiriesLoading] = useState(false);
  const [propertyEnquiriesError, setPropertyEnquiriesError] = useState('');
  const [expandedPropertyEnquiryId, setExpandedPropertyEnquiryId] = useState(null);
  const [propertyEnquiryDetails, setPropertyEnquiryDetails] = useState({});
  const [propertyEnquiryDetailLoading, setPropertyEnquiryDetailLoading] = useState('');

  const formatDeadlineParts = (deadline) => {
    if (!deadline) return { date: '', time: '' };

    const raw = String(deadline).trim();

    // Try to parse common API formats: "YYYY-MM-DD HH:mm:ss" or ISO
    const isoLike = raw.includes('T') ? raw : raw.replace(' ', 'T');
    const dt = new Date(isoLike);

    if (!Number.isNaN(dt.getTime())) {
      const dd = String(dt.getDate()).padStart(2, '0');
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const yyyy = String(dt.getFullYear());
      const date = `${dd}-${mm}-${yyyy}`;

      const time = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(dt);

      return { date, time };
    }

    // Fallback: show raw string if parsing fails
    return { date: raw, time: '' };
  };

  const getCountdown = (deadline) => {
    if (!deadline) return '';

    const raw = String(deadline).trim();
    const isoLike = raw.includes('T') ? raw : raw.replace(' ', 'T');
    const target = new Date(isoLike);

    if (Number.isNaN(target.getTime())) return '';

    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return 'Expired';

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
      return `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    }
    if (hours > 0) {
      return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    }
    return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
  };

  const getDigitalTime = () => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(now);
  };

  /** API status_text can vary in casing; avoid showing upload/timer after admin approval */
  const normStatus = (task) => String(task?.status_text ?? '').trim().toLowerCase();

  /** Finished tasks: approved by admin OR API label e.g. "Task Completed" */
  const isTaskApprovedByAdmin = (task) => {
    const s = normStatus(task);
    if (!s) return false;
    if (s === 'task completed' || s.includes('task completed')) return true;
    if (s === 'approved' || s === 'approve' || s === 'complete' || s === 'completed') return true;
    if (s.includes('approv') && !s.includes('disapprov') && !s.includes('unapprov')) return true;
    return false;
  };

  const isTaskDenied = (task) => {
    const s = normStatus(task);
    return s === 'denied' || s === 'rejected';
  };

  /** Upload only when work is still required (not approved; not waiting on admin after submit unless denied for re-upload) */
  const shouldShowUploadButton = (task) => {
    if (isTaskApprovedByAdmin(task)) return false;
    if (isTaskDenied(task)) return true;
    if (task.status === 1 && !isTaskDenied(task)) return false;
    if (task.status === 0 || task.status === 2) return true;
    return false;
  };

  /** Hide countdown when approved or when submission is with admin (unless denied) */
  const shouldShowDeadlineCountdown = (task) => {
    if (!task.task_deadline) return false;
    if (isTaskApprovedByAdmin(task)) return false;
    if (task.status === 1 && !isTaskDenied(task)) return false;
    return true;
  };

  const myTaskBadge = (task) => {
    const label =
      task.status_text ||
      (task.status === 2 ? 'Accepted' : task.status === 1 ? 'Submitted' : 'Pending');
    let bg = '#6c757d';
    let color = '#fff';
    if (isTaskApprovedByAdmin(task)) {
      bg = '#198754';
      color = '#fff';
    } else if (isTaskDenied(task)) {
      bg = '#dc3545';
      color = '#fff';
    } else if (task.status === 1) {
      bg = '#0dcaf0';
      color = '#052c46';
    } else if (task.status === 2) {
      bg = '#ffc107';
      color = '#212529';
    }
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '5px 12px',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 700,
          backgroundColor: bg,
          color,
          border: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        {label}
      </span>
    );
  };

  const availableTaskBadge = (task) => {
    const s = normStatus(task);
    const label = task.status_text || 'Available';
    let bg = '#198754';
    let color = '#fff';
    if (s === 'pending') {
      bg = '#ffc107';
      color = '#212529';
    } else if (s === 'denied') {
      bg = '#dc3545';
      color = '#fff';
    }
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '5px 12px',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 700,
          backgroundColor: bg,
          color,
          border: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        {label}
      </span>
    );
  };

  useEffect(() => {
    // Check if partner is logged in
    const authData = localStorage.getItem('infrioAuth');
    if (!authData) {
      navigate('/login');
      return;
    }

    const auth = safeJsonParse(authData, null);
    if (!auth || typeof auth !== 'object') {
      clearAppStorage();
      navigate('/login');
      return;
    }
    const role = String(auth.role || auth.user_type || auth.type || '').toLowerCase();
    if (role === 'normal' || role === 'user') {
      navigate('/user-account', { replace: true });
      return;
    }
    if (role !== 'partner') {
      if (auth.role === 'seller') {
        navigate('/seller-dashboard', { replace: true });
      } else {
        navigate('/user-account', { replace: true });
      }
      return;
    }

    // Fetch partner details from API
    const fetchPartnerDetails = async () => {
      try {
        setLoading(true);
        
        // Get user_id from auth or partnerInfo
        let userId = auth.userId || auth.id;
        if (!userId) {
          const partnerInfo = localStorage.getItem('partnerInfo');
          if (partnerInfo) {
            const partner = safeJsonParse(partnerInfo, null);
            if (partner && typeof partner === 'object') userId = partner.id;
          }
        }

        if (!userId) {
          // If no userId available, use localStorage data
          const partnerInfo = localStorage.getItem('partnerInfo');
          if (partnerInfo) {
            const parsed = safeJsonParse(partnerInfo, null);
            if (parsed && typeof parsed === 'object') setPartnerData(parsed);
          }
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append('user_id', userId);

        const response = await fetch('https://www.admin.infrioindia.com/api/v2/auth/get-user-details', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.success && result.data) {
          // Update partner data with API response
          setPartnerData({
            id: result.data.id,
            name: result.data.name,
            email: result.data.email,
            phone: result.data.phone,
            city: result.data.city,
            user_type: result.data.user_type,
            email_verified_at: result.data.email_verified_at,
            address: result.data.address,
            state: result.data.state,
            country: result.data.country,
            postal_code: result.data.postal_code,
            join_us: result.data.join_us,
            created_at: result.data.created_at,
            updated_at: result.data.updated_at
          });

          // Also update localStorage
          localStorage.setItem('partnerInfo', JSON.stringify({
            id: result.data.id,
            name: result.data.name,
            email: result.data.email,
            phone: result.data.phone,
            city: result.data.city,
            user_type: result.data.user_type,
            join_us: result.data.join_us
          }));
        } else {
          // Fallback to localStorage if API fails
          const partnerInfo = localStorage.getItem('partnerInfo');
          if (partnerInfo) {
            const parsed = safeJsonParse(partnerInfo, null);
            if (parsed && typeof parsed === 'object') setPartnerData(parsed);
          }
        }
      } catch (error) {
        console.error('Error fetching partner details:', error);
        // Fallback to localStorage if API fails
        const partnerInfo = localStorage.getItem('partnerInfo');
        if (partnerInfo) {
          const parsed = safeJsonParse(partnerInfo, null);
          if (parsed && typeof parsed === 'object') setPartnerData(parsed);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPartnerDetails();

    fetchAvailableTasks();
    fetchMyTasks();
  }, [navigate]);

  // global ticking clock for countdowns
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchQuotations = async (userId) => {
    if (!userId) return;
    try {
      setQuotationsLoading(true);
      setQuotationsError(null);
      const url = `${QUOTATION_LIST_API}?user_id=${encodeURIComponent(userId)}`;
      const response = await fetch(url, { method: 'POST', headers: { Accept: 'application/json' } });
      const result = await response.json();
      if (result.status && Array.isArray(result.data)) {
        setQuotations(result.data);
      } else {
        setQuotationsError(result.message || 'Failed to load quotations');
        setQuotations([]);
      }
    } catch (err) {
      console.error('Error fetching quotations:', err);
      setQuotationsError('Something went wrong while loading your quotations.');
      setQuotations([]);
    } finally {
      setQuotationsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'quotations' && partnerData?.id) {
      fetchQuotations(partnerData.id);
    }
  }, [activeTab, partnerData?.id]);

  const fetchPropertyEnquiries = async (userId) => {
    const inquiryUserId = getCurrentInquiryUserId() || userId;
    if (!inquiryUserId) return;
    try {
      setPropertyEnquiriesLoading(true);
      setPropertyEnquiriesError('');
      const result = await fetchUserPropertyInquiries({
        userId: inquiryUserId,
        page: 1,
        perPage: 50,
      });
   //   console.log('Fetched property enquiries:', result);
      const rootInquiries = Array.isArray(result.raw?.data?.properties)
        ? result.raw.data.properties.map(normalizePropertyInquiry)
        : [];
     //   console.log('Normalized property enquiries:', result.raw);
      setPropertyEnquiries(result.items?.length ? result.items : rootInquiries);
    } catch (error) {
      console.error('Error fetching property enquiries:', error);
      setPropertyEnquiries([]);
      setPropertyEnquiriesError('Unable to load your property enquiries right now.');
    } finally {
      setPropertyEnquiriesLoading(false);
    }
  };

  const togglePropertyEnquiryDetail = async (item) => {
    const rowId = item?.id || item?.createdAt;
    if (!rowId) return;
    const isOpen = String(expandedPropertyEnquiryId) === String(rowId);
    if (isOpen) {
      setExpandedPropertyEnquiryId(null);
      return;
    }
    setExpandedPropertyEnquiryId(rowId);
    if (propertyEnquiryDetails[rowId]) return;
    try {
      setPropertyEnquiryDetailLoading(String(rowId));
      const detail = await fetchUserPropertyInquiryDetail({
        userId: getCurrentInquiryUserId() || partnerData?.id,
        inquiryId: rowId,
      });
      setPropertyEnquiryDetails((prev) => ({
        ...prev,
        [rowId]: detail || item,
      }));
    } catch (error) {
      console.error('Error fetching property enquiry detail:', error);
      setPropertyEnquiryDetails((prev) => ({
        ...prev,
        [rowId]: item,
      }));
    } finally {
      setPropertyEnquiryDetailLoading('');
    }
  };

  useEffect(() => {
    const inquiryUserId = getCurrentInquiryUserId() || partnerData?.id;
    if (activeTab === 'enquiries' && inquiryUserId) {
      fetchPropertyEnquiries(inquiryUserId);
    }
  }, [activeTab, partnerData?.id]);

  const fetchAvailableTasks = async () => {
    try {
      setAvailableLoading(true);
      setAvailableError(null);
      const authData = localStorage.getItem('infrioAuth');
      const auth = safeJsonParse(authData, null);
      const userId = auth?.userId || auth?.id;
      console.log("lknldknlkdc",userId)
      if (!userId) {
        setAvailableTasks([]);
        setAvailableLoading(false);
        return;
      }
      const formData = new FormData();
      formData.append('user_id', userId);
      const response = await fetch('https://www.admin.infrioindia.com/api/v2/auth/architecture-accept-form-all', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      if (result.status && result.data && result.data.data) {
        setAvailableTasks(result.data.data);
      } else {
        setAvailableError(result.message || 'Failed to load available tasks');
      }
    } catch (err) {
      console.error('Error fetching available tasks:', err);
      setAvailableError('Something went wrong while loading available tasks.');
    } finally {
      setAvailableLoading(false);
    }
  };

  const fetchMyTasks = async () => {
    try {
      setMyTasksLoading(true);
      setMyTasksError(null);
      const authData = localStorage.getItem('infrioAuth');
      const auth = safeJsonParse(authData, null);
      const userId = auth?.userId || auth?.id;
      if (!userId) {
        setMyTasks([]);
        setMyTasksLoading(false);
        return;
      }
      const formData = new FormData();
      formData.append('user_id', userId);
      const response = await fetch('https://www.admin.infrioindia.com/api/v2/auth/architecture-user-dashboard-my-task', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      if (result.status && result.data) {
        setMyTasks(result.data);
      } else {
        setMyTasksError(result.message || 'Failed to load your tasks');
      }
    } catch (err) {
      console.error('Error fetching my tasks:', err);
      setMyTasksError('Something went wrong while loading your tasks.');
    } finally {
      setMyTasksLoading(false);
    }
  };

  const handleLogout = () => {
    clearAppStorage();
    navigate('/login');
  };

  const handleAcceptTask = async (task) => {
    try {
      const authData = localStorage.getItem('infrioAuth');
      const auth = safeJsonParse(authData, null);
      const userId = auth?.userId || auth?.id;
      if (!userId) {
        alert('Please login again.');
        return;
      }
      const formData = new FormData();
      formData.append('form_id', task.id);
      formData.append('status', 2); // accept
      formData.append('user_id', userId);
      const response = await fetch('https://www.admin.infrioindia.com/api/v2/auth/architecture-accept-user-form', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      if (result.status) {
       // alert(result.message || 'Task accepted successfully');
        fetchAvailableTasks();
        fetchMyTasks();
      } else {
        alert(result.message || 'Failed to accept task');
      }
    } catch (err) {
      console.error('Error accepting task:', err);
      alert('Something went wrong. Please try again.');
    }
  };

  const handleUploadClick = (task) => {
    setSelectedTask(task);
    setShowUploadModal(true);
  };

  const handleFileChange = (e) => {
    setUploadFile(e.target.files);
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    if (!uploadFile || uploadFile.length === 0) {
      alert('Please select at least one file to upload');
      return;
    }
    try {
      setUploading(true);
      const authData = localStorage.getItem('infrioAuth');
      const auth = safeJsonParse(authData, null);
      const userId = auth?.userId || auth?.id;
      if (!userId) {
        alert('Please login again.');
        setUploading(false);
        return;
      }
      const formData = new FormData();
      formData.append('acceptance_id', selectedTask.id);
      formData.append('user_id', userId);
      // Append files as document[]
      Array.from(uploadFile).forEach((file) => {
        formData.append('document[]', file);
      });

      const response = await fetch('https://www.admin.infrioindia.com/api/v2/auth/architecture-upload-work-task', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      if (result.status) {
        // alert(result.message || 'Work submitted successfully!');
        setShowUploadModal(false);
        setUploadFile(null);
        setSelectedTask(null);
        fetchMyTasks();
      } else {
        alert(result.message || 'Failed to submit work. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting work:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading || !partnerData) {
    return (
      <div className="section-full p-t80 p-b80 bg-gray" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="m-t20">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title="Partner Account" noindex />
      <Header2 />
      <div className="page-content">
        <Banner
          title="Partner Dashboard"
          pagename="My Account"
          description="Manage your assigned tasks and submit completed work."
          bgimage={bannerImg}
        />
        
        <div className="section-full p-t80 p-b80 bg-gray">
          <div className="container">
            {/* Partner Info Card */}
            <div className="row m-b30">
              <div className="col-lg-12">
                <div className="bg-white shadow-sm p-a30 border-radius-10">
                  <div className="d-flex justify-content-between align-items-center flex-wrap">
                    <div>
                      <h3 className="m-b10">Welcome, {partnerData.name || 'Partner'}</h3>
                      <p className="text-muted m-b0">
                        <i className="fa fa-briefcase m-r10"></i>{partnerData.joinAs || 'Partner'}
                      </p>
                      <p className="text-muted m-b0">
                        <i className="fa fa-envelope m-r10"></i>{partnerData.email || 'N/A'}
                      </p>
                      <p className="text-muted m-b0">
                        <i className="fa fa-phone m-r10"></i>{partnerData.phone || 'N/A'}
                      </p>
                      <p className="text-muted m-b0">
                        <i className="fa fa-map-marker m-r10"></i>{partnerData.city || 'N/A'}
                      </p>
                    </div>
                    <button className="site-button-secondry" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="row">
              <div className="col-lg-12">
                <div className="bg-white shadow-sm border-radius-10 overflow-hidden">
                  <ul className="nav nav-tabs p-a20 m-b0" style={{ borderBottom: '2px solid #f0f0f0' }}>
                    <li className="nav-item">
                      <button 
                        className={`nav-link ${activeTab === 'enquiries' ? 'active' : ''}`}
                        onClick={() => setActiveTab('enquiries')}
                        style={{ border: 'none', background: 'transparent', padding: '10px 20px', cursor: 'pointer' }}
                      >
                        My Property Enquiries
                      </button>
                    </li>
                    <li className="nav-item">
                      <button 
                        className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                        style={{ border: 'none', background: 'transparent', padding: '10px 20px', cursor: 'pointer' }}
                      >
                        Profile
                      </button>
                    </li>
                  </ul>

                  <div className="p-a30">
                    {activeTab === 'tasks' && (
                      <div>
                        <h4 className="m-b20">My Assigned Tasks</h4>
                        {myTasksLoading ? (
                          <div className="text-center p-a40">
                            <div className="spinner-border text-primary" role="status">
                              <span className="sr-only">Loading...</span>
                            </div>
                            <p className="m-t20 text-muted">Loading your tasks...</p>
                          </div>
                        ) : myTasksError ? (
                          <div className="alert alert-danger">
                            <i className="fa fa-exclamation-triangle m-r10"></i>
                            {myTasksError}
                            <button className="btn btn-sm btn-outline-danger m-l10" onClick={fetchMyTasks}>
                              Retry
                            </button>
                          </div>
                        ) : myTasks.length === 0 ? (
                          <div className="text-center p-a40">
                            <p className="text-muted">No tasks assigned yet. Check Available Tasks to accept new assignments.</p>
                          </div>
                        ) : (
                          <div className="row">
                            {myTasks.map((task) => (
                              <div key={task.id} className="col-lg-6 col-md-12 m-b30">
                                <div className="bg-gray-light p-a20 border-radius-10 h-100">
                                  <div className="d-flex justify-content-between align-items-start m-b15">
                                    <div>
                                      <h5 className="m-b5" style={{ color: '#1a1a1a' }}>Task #{task.id}</h5>
                                      {myTaskBadge(task)}
                                    </div>
                                    {/* Task deadline + timer only while task is active (hide when approved / with admin) */}
                                    {shouldShowDeadlineCountdown(task) && (() => {
                                      const { date: deadlineDate, time: deadlineTime } = formatDeadlineParts(task.task_deadline);
                                      return (
                                        <div style={{ textAlign: 'right' }}>
                                          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#c53030' }}>
                                            Deadline
                                          </div>
                                          <div
                                            style={{
                                              border: '1px solid #c53030',
                                              borderRadius: 6,
                                              padding: '6px 14px',
                                              minWidth: 130,
                                              backgroundColor: '#fff5f5',
                                              fontSize: 12,
                                              fontWeight: 500,
                                              lineHeight: 1.4,
                                            }}
                                          >
                                            <div style={{ whiteSpace: 'nowrap' }}>{deadlineDate} | {deadlineTime}</div>
                                            {/* {deadlineTime && <div style={{ whiteSpace: 'nowrap' }}>{deadlineTime}</div>} */}
                                            {task.task_deadline && (() => {
                                    const countdown = getCountdown(task.task_deadline);
                                    const digital = getDigitalTime();
                                    return (
                                      <div  style={{ textAlign: 'right', fontSize: 11,whiteSpace: 'nowrap',color: '#c53030' }}>
                                        {countdown && (
                                          <div style={{ color: '#c53030', margin: 2 }}>
                                            Time Left: {countdown}
                                          </div>
                                        )}
                                     
                                      </div>
                                    );
                                  })()}
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </div>

                                  {/* Separate countdown + digital clock row */}
                                

                                  <ul className="list-unstyled text-muted small m-b10 m-t10">
                                    {task.property_type && <li><strong>Property Type:</strong> {task.property_type}</li>}
                                    {task.plot_size && <li><strong>Plot Size:</strong> {task.plot_size}</li>}
                                    {task.plot_type && <li><strong>Plot Type:</strong> {task.plot_type}</li>}
                                    {task.plot_direction && <li><strong>Plot Direction:</strong> {task.plot_direction}</li>}
                                    {task.construction_type && <li><strong>Construction Type:</strong> {task.construction_type}</li>}
                                    {task.construction_stage && <li><strong>Construction Stage:</strong> {task.construction_stage}</li>}
                                    {task.floors && <li><strong>Floors:</strong> {task.floors}</li>}
                                    {task.bedrooms_count && <li><strong>Bedrooms/Rooms:</strong> {task.bedrooms_count}</li>}
                                    {task.drawing_living && <li><strong>Drawing/Living:</strong> {task.drawing_living}</li>}
                                    {task.dining && <li><strong>Dining:</strong> {task.dining}</li>}
                                    {task.kitchen && <li><strong>Kitchen:</strong> {task.kitchen}</li>}
                                    {task.kitchen_store && <li><strong>Kitchen Store:</strong> {task.kitchen_store}</li>}
                                    {task.toilets_count && <li><strong>Toilets Count:</strong> {task.toilets_count}</li>}
                                    {task.wash_area && <li><strong>Wash Area:</strong> {task.wash_area}</li>}
                                    {task.temple && <li><strong>Temple:</strong> {task.temple}</li>}
                                    {task.stairs && <li><strong>Stairs:</strong> {task.stairs}</li>}
                                    {task.two_wheeler_parking && <li><strong>Two-wheeler Parking:</strong> {task.two_wheeler_parking}</li>}
                                    {task.four_wheeler_parking && <li><strong>Four-wheeler Parking:</strong> {task.four_wheeler_parking}</li>}
                                    {task.completion_time && <li><strong>Completion Time:</strong> {task.completion_time}</li>}
                                    {task.interior_furniture && <li><strong>Interior/Furniture:</strong> {task.interior_furniture}</li>}
                                    {task.commercial_type && <li><strong>Commercial Type:</strong> {task.commercial_type}</li>}
                                    {task.requirements && <li><strong>Requirements:</strong> {task.requirements}</li>}
                                    {task.client_name && <li><strong>Client Name:</strong> {task.client_name}</li>}
                                    {task.created_at && <li><strong>Created:</strong> {task.created_at}</li>}
                                  </ul>
                                  {/* Admin decision — high contrast so Denied / Approved text is readable */}
                                  {(isTaskApprovedByAdmin(task) || isTaskDenied(task)) && task.description && (
                                    <div
                                      className="m-b15"
                                      style={{
                                        padding: '12px 14px',
                                        borderRadius: 8,
                                        fontSize: 14,
                                        lineHeight: 1.5,
                                        ...(isTaskDenied(task)
                                          ? {
                                              color: '#842029',
                                              backgroundColor: '#f8d7da',
                                              border: '1px solid #f5c2c7',
                                            }
                                          : {
                                              color: '#0f5132',
                                              backgroundColor: '#d1e7dd',
                                              border: '1px solid #badbcc',
                                            }),
                                      }}
                                    >
                                      <strong style={{ display: 'block', marginBottom: 6 }}>
                                        {task.status_text || (isTaskApprovedByAdmin(task) ? 'Approved' : 'Denied')}
                                      </strong>
                                      <span>{task.description}</span>
                                    </div>
                                  )}
                                  {isTaskApprovedByAdmin(task) && !task.description && (
                                    <div
                                      className="m-b15"
                                      style={{
                                        padding: '12px 14px',
                                        borderRadius: 8,
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: '#0f5132',
                                        backgroundColor: '#d1e7dd',
                                        border: '1px solid #badbcc',
                                      }}
                                    >
                                      ✓ Approved by admin — this task is complete.
                                    </div>
                                  )}
                                  {isTaskApprovedByAdmin(task) && task.document && (
                                    <div className="m-b15">
                                      <a
                                        href={task.document}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="site-button-secondry btn-sm"
                                      >
                                        View Submitted File
                                      </a>
                                    </div>
                                  )}

                                  {shouldShowUploadButton(task) && (
                                    <button 
                                      className="site-button btn-sm"
                                      onClick={() => handleUploadClick(task)}
                                    >
                                      Upload & Submit Work
                                    </button>
                                  )}
                                  {/* Submitted, awaiting admin — not denied */}
                                  {task.status === 1 && !isTaskDenied(task) && !isTaskApprovedByAdmin(task) && (
                                    <div>
                                      <p className="text-info m-b10">
                                        <small>✓ Submitted. Awaiting admin review.</small>
                                      </p>
                                      {task.document && (
                                        <a href={task.document} target="_blank" rel="noopener noreferrer" className="site-button-secondry btn-sm">
                                          View Submitted File
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'available' && (
                      <div>
                        <h4 className="m-b20">Available Tasks</h4>
                        <p className="text-muted m-b20">These tasks are available for all partners. Accept a task to start working on it.</p>
                        {availableLoading ? (
                          <div className="text-center p-a40">
                            <div className="spinner-border text-primary" role="status">
                              <span className="sr-only">Loading...</span>
                            </div>
                            <p className="m-t20 text-muted">Loading available tasks...</p>
                          </div>
                        ) : availableError ? (
                          <div className="alert alert-danger">
                            <i className="fa fa-exclamation-triangle m-r10"></i>
                            {availableError}
                            <button className="btn btn-sm btn-outline-danger m-l10" onClick={fetchAvailableTasks}>
                              Retry
                            </button>
                          </div>
                        ) : availableTasks.length === 0 ? (
                          <div className="text-center p-a40">
                            <p className="text-muted">No available tasks at the moment.</p>
                          </div>
                        ) : (
                          <div className="row">
                            {availableTasks.map((task) => (
                              <div key={task.id} className="col-lg-6 col-md-12 m-b30">
                                <div className="bg-gray-light p-a20 border-radius-10 h-100">
                                  <div className="d-flex justify-content-between align-items-start m-b15">
                                    <div>
                                      <h5 className="m-b5" style={{ color: '#1a1a1a' }}>Architecture Request #{task.id}</h5>
                                      {availableTaskBadge(task)}
                                    </div>
                                    {/* Task deadline box aligned with header (only date & time) */}
                                    {task.task_deadline && (() => {
                                      const { date: deadlineDate, time: deadlineTime } = formatDeadlineParts(task.task_deadline);
                                      return (
                                        <div style={{ textAlign: 'right' }}>
                                          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#c05621' }}>
                                            Deadline
                                          </div>
                                          <div
                                            style={{
                                              border: '1px solid #c05621',
                                              borderRadius: 6,
                                              padding: '6px 14px',
                                              minWidth: 130,
                                              backgroundColor: '#fffaf0',
                                              fontSize: 12,
                                              fontWeight: 500,
                                              lineHeight: 1.4,
                                            }}
                                          >
                                            <div style={{ whiteSpace: 'nowrap' }}>{deadlineDate} | {deadlineTime}</div>
                                            {/* {deadlineTime && <div style={{ whiteSpace: 'nowrap' }}>{deadlineTime}</div>} */}
                                          </div>
                                        </div>
                                      );
                                    })()}
                                  </div>

                               

                                  <ul className="list-unstyled text-muted small m-b10 m-t10">
                                    {task.property_type && <li><strong>Property Type:</strong> {task.property_type}</li>}
                                    {task.plot_size && <li><strong>Plot Size:</strong> {task.plot_size}</li>}
                                    {task.plot_type && <li><strong>Plot Type:</strong> {task.plot_type}</li>}
                                    {task.plot_direction && <li><strong>Plot Direction:</strong> {task.plot_direction}</li>}
                                    {task.construction_type && <li><strong>Construction Type:</strong> {task.construction_type}</li>}
                                    {task.construction_stage && <li><strong>Construction Stage:</strong> {task.construction_stage}</li>}
                                    {task.floors && <li><strong>Floors:</strong> {task.floors}</li>}
                                    {task.bedrooms_count && <li><strong>Bedrooms/Rooms:</strong> {task.bedrooms_count}</li>}
                                    {task.drawing_living && <li><strong>Drawing/Living:</strong> {task.drawing_living}</li>}
                                    {task.dining && <li><strong>Dining:</strong> {task.dining}</li>}
                                    {task.kitchen && <li><strong>Kitchen:</strong> {task.kitchen}</li>}
                                    {task.kitchen_store && <li><strong>Kitchen Store:</strong> {task.kitchen_store}</li>}
                                    {task.toilets_count && <li><strong>Toilets Count:</strong> {task.toilets_count}</li>}
                                    {task.wash_area && <li><strong>Wash Area:</strong> {task.wash_area}</li>}
                                    {task.temple && <li><strong>Temple:</strong> {task.temple}</li>}
                                    {task.stairs && <li><strong>Stairs:</strong> {task.stairs}</li>}
                                    {task.two_wheeler_parking && <li><strong>Two-wheeler Parking:</strong> {task.two_wheeler_parking}</li>}
                                    {task.four_wheeler_parking && <li><strong>Four-wheeler Parking:</strong> {task.four_wheeler_parking}</li>}
                                    {task.completion_time && <li><strong>Completion Time:</strong> {task.completion_time}</li>}
                                    {task.interior_furniture && <li><strong>Interior/Furniture:</strong> {task.interior_furniture}</li>}
                                    {task.commercial_type && <li><strong>Commercial Type:</strong> {task.commercial_type}</li>}
                                    {task.requirements && <li><strong>Requirements:</strong> {task.requirements}</li>}
                                    {/* {task.created_at && <li><strong>Created:</strong> {task.created_at}</li>} */}
                                  </ul>
                                  {/* <p className="text-muted m-b10"><small>Status: {task.status_text || (task.status !== undefined ? task.status : 'N/A')}</small></p> */}
                                  <button 
                                    className="site-button btn-sm"
                                    onClick={() => handleAcceptTask(task)}
                                  >
                                    Accept Task
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'quotations' && (
                      <div>
                        <h4 className="m-b20" style={{ color: '#1a1a1a', fontWeight: 700 }}>My Quotations</h4>
                        <p className="text-muted m-b20">Product enquiries submitted from the shop under your partner account.</p>
                        {quotationsLoading ? (
                          <div className="text-center p-a40">
                            <div className="spinner-border text-primary" role="status">
                              <span className="sr-only">Loading...</span>
                            </div>
                            <p className="m-t20 text-muted">Loading your quotations...</p>
                          </div>
                        ) : quotationsError ? (
                          <div className="alert alert-danger d-flex align-items-center justify-content-between flex-wrap">
                            <span><i className="fa fa-exclamation-triangle m-r10"></i>{quotationsError}</span>
                            <button type="button" className="btn btn-sm btn-outline-danger m-t10 m-t0" onClick={() => fetchQuotations(partnerData.id)}>Retry</button>
                          </div>
                        ) : quotations.length === 0 ? (
                          <div className="text-center p-a40">
                            <p className="text-muted">No quotations yet.</p>
                            <NavLink to="/shop" className="site-button btn-half m-t20" style={{ background: THEME_PRIMARY, borderColor: THEME_PRIMARY }}>
                              Request New Quotation
                            </NavLink>
                          </div>
                        ) : (
                          <div className="row">
                            <div className="col-lg-12 quotation-list-wrap">
                              {quotations.map((q) => (
                                <div key={q.id} className="quotation-list-card">
                                  <div
                                    className="d-flex justify-content-between align-items-center flex-wrap"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setExpandedQuotationId(expandedQuotationId === q.id ? null : q.id)}
                                  >
                                    <div className="d-flex align-items-center flex-wrap" style={{ gap: 12 }}>
                                      <span className="quotation-list-id">Quotation #{q.id}</span>
                                      <span className="quotation-list-date">Requested: {q.created_at || 'N/A'}</span>
                                      <span className="quotation-list-total">Total: ₹{Number(q.total_price ?? 0).toLocaleString()}</span>
                                    </div>
                                    <span className="quotation-list-view">
                                      {expandedQuotationId === q.id ? '▼ Hide details' : '▶ View details'}
                                    </span>
                                  </div>
                                  {expandedQuotationId === q.id && Array.isArray(q.items) && q.items.length > 0 && (
                                    <div className="m-t20 p-t20 border-top">
                                      <h6 className="m-b15" style={{ color: '#333', fontWeight: 600 }}>Products in this quotation</h6>
                                      <div className="table-responsive">
                                        <table className="table table-bordered table-sm">
                                          <thead>
                                            <tr style={{ background: '#f5f2ef' }}>
                                              <th style={{ color: '#1a1a1a' }}>Product</th>
                                              <th style={{ color: '#1a1a1a' }}>Brand</th>
                                              <th style={{ color: '#1a1a1a' }}>Category</th>
                                              <th className="text-end" style={{ color: '#1a1a1a' }}>Price</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {q.items.map((item) => (
                                              <tr key={item.id || item.product_id}>
                                                <td>
                                                  <div className="d-flex align-items-center" style={{ gap: 12 }}>
                                                    {(item.product_thumbnail_img || item.product_photos?.[0]) && (
                                                      <img
                                                        src={item.product_thumbnail_img || item.product_photos[0]}
                                                        alt=""
                                                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                                                      />
                                                    )}
                                                    <button
                                                      type="button"
                                                      className="btn btn-link p-0 align-baseline text-start"
                                                      style={{ fontWeight: 500 }}
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedQuotationProduct(mapInquiryItemToProduct(item));
                                                      }}
                                                    >
                                                      {item.name || '—'}
                                                    </button>
                                                  </div>
                                                </td>
                                                <td>{item.brand_name || '—'}</td>
                                                <td>{item.category_name || '—'}</td>
                                                <td className="text-end">₹{Number(item.price ?? 0).toLocaleString()}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="col-12 text-center m-t20">
                              <NavLink to="/shop" className="site-button btn-sm" style={{ background: THEME_PRIMARY, borderColor: THEME_PRIMARY }}>
                                Request New Quotation
                              </NavLink>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'enquiries' && (
                      <div>
                        <div className="d-flex justify-content-between align-items-center flex-wrap m-b20">
                          <div>
                            <h4 className="m-b5" style={{ color: '#1a1a1a', fontWeight: 700 }}>
                              My Property Enquiries
                            </h4>
                            <p className="text-muted m-b0">
                              Track all property enquiries submitted from your account.
                            </p>
                          </div>
                          <button
                            type="button"
                            className="site-button-secondry btn-sm"
                            onClick={() => fetchPropertyEnquiries(getCurrentInquiryUserId() || partnerData.id)}
                            disabled={propertyEnquiriesLoading}
                          >
                            Refresh
                          </button>
                        </div>

                        {propertyEnquiriesLoading ? (
                          <div className="text-center p-a40">
                            <div className="spinner-border text-primary" role="status">
                              <span className="sr-only">Loading...</span>
                            </div>
                            <p className="m-t20 text-muted">Loading your property enquiries...</p>
                          </div>
                        ) : propertyEnquiriesError ? (
                          <div className="alert alert-danger d-flex align-items-center justify-content-between flex-wrap">
                            <span>
                              <i className="fa fa-exclamation-triangle m-r10"></i>
                              {propertyEnquiriesError}
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger m-t10 m-t0"
                              onClick={() => fetchPropertyEnquiries(getCurrentInquiryUserId() || partnerData.id)}
                            >
                              Retry
                            </button>
                          </div>
                        ) : propertyEnquiries.length === 0 ? (
                          <div className="text-center p-a40">
                            <p className="text-muted">No property enquiries found.</p>
                            <NavLink
                              to="/properties"
                              className="site-button btn-half m-t20"
                              style={{ background: THEME_PRIMARY, borderColor: THEME_PRIMARY }}
                            >
                              Browse Properties
                            </NavLink>
                          </div>
                        ) : (
                          <div className="table-responsive">
                            <table className="table table-bordered align-middle">
                              <thead>
                                <tr style={{ background: '#f5f2ef' }}>
                                  <th>Property</th>
                                  <th>Location</th>
                                  <th>Price</th>
                                  <th>Status</th>
                                
                                  <th>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {propertyEnquiries.map((item) => {
                                  const rowId = item.id || item.createdAt;
                                  const isOpen = String(expandedPropertyEnquiryId) === String(rowId);
                                  const detail = propertyEnquiryDetails[rowId] || item;
                                  const sellerName =
                                    detail.seller?.name ||
                                    detail.sellerName ||
                                    detail.seller_name ||
                                    item.seller?.name ||
                                    'Seller';
                                  const propertyName =
                                    detail.propertyTitle ||
                                    item.propertyTitle ||
                                    detail.propertyName ||
                                    item.propertyName ||
                                    detail.property_name ||
                                    'Property enquiry';
                                  const propertyType =
                                    detail.propertyType ||
                                    item.propertyType ||
                                    'N/A';
                                  const propertyImage =
                                    detail.propertyImage ||
                                    item.propertyImage ||
                                    '';
                                  const locationText =
                                    detail.propertyLocation ||
                                    item.propertyLocation ||
                                    detail.propertyCity ||
                                    item.propertyCity ||
                                    detail.location ||
                                    item.location ||
                                    'N/A';
                                  const priceText = formatPropertyDisplayPrice(
                                    detail.propertyPrice ||
                                      item.propertyPrice ||
                                      detail.price ||
                                      item.price,
                                    detail.propertyPriceValue ||
                                      item.propertyPriceValue,
                                  );
                                  const statusText = detail.status || item.status || 'New';
                                  const followups = detail.followUps || item.followUps || [];
                                  return (
                                    <React.Fragment key={rowId}>
                                      <tr>
                                        <td>
                                          <div className="d-flex align-items-center" style={{ gap: 12, minWidth: 280 }}>
                                            {propertyImage ? (
                                              <img
                                                src={propertyImage}
                                                alt={propertyName}
                                                style={{
                                                  width: 74,
                                                  height: 58,
                                                  objectFit: 'cover',
                                                  borderRadius: 8,
                                                  flexShrink: 0,
                                                }}
                                              />
                                            ) : null}
                                            <div>
                                              <strong>{propertyName}</strong>
                                              <div className="text-muted small">{propertyType}</div>
                                            </div>
                                          </div>
                                        </td>
                                        <td>
                                          <strong>{locationText}</strong>
                                          {(detail.propertyArea || item.propertyArea) ? (
                                            <div className="text-muted small">
                                              {detail.propertyArea || item.propertyArea}
                                            </div>
                                          ) : null}
                                        </td>
                                        <td><strong>{priceText}</strong></td>
                                        <td>
                                          <span style={{ display: 'inline-block', padding: '6px 12px', borderRadius: 999, fontWeight: 700, fontSize: 13, ...statusBadgeStyle(statusText) }}>
                                            {statusText}
                                          </span>
                                        </td>
                                        <td>
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => togglePropertyEnquiryDetail(item)}
                                            disabled={propertyEnquiryDetailLoading === String(rowId)}
                                          >
                                            {propertyEnquiryDetailLoading === String(rowId)
                                              ? 'Loading...'
                                              : isOpen
                                                ? 'Hide'
                                                : 'View'}
                                          </button>
                                        </td>
                                      </tr>
                                      {isOpen ? (
                                        <tr>
                                          <td colSpan="6">
                                            <div className="row">
                                              {/* <div className="col-md-6 m-b15">
                                                <h6>Enquiry Details</h6>
                                                <p className="m-b5"><strong>Name:</strong> {detail.name || partnerData.name || 'N/A'}</p>
                                                <p className="m-b5"><strong>Email:</strong> {detail.email || partnerData.email || 'N/A'}</p>
                                                <p className="m-b5"><strong>Phone:</strong> {detail.mobile || detail.phone || partnerData.phone || 'N/A'}</p>
                                                <p className="m-b5"><strong>City:</strong> {detail.city || partnerData.city || 'N/A'}</p>
                                                <p className="m-b5"><strong>Message:</strong> {detail.message || 'N/A'}</p>
                                              </div> */}
                                              <div className="col-md-6 m-b15">
                                                <h6>Property </h6>
                                                {/* <p className="m-b5"><strong>Property:</strong> {propertyName}</p> */}
                                                <p className="m-b5"><strong>Type:</strong> {propertyType}</p>
                                                <p className="m-b5"><strong>Price:</strong> {priceText}</p>
                                                <p className="m-b5"><strong>Location:</strong> {locationText}</p>
                                                {/* <p className="m-b5"><strong>Seller:</strong> {sellerName}</p> */}
                                                <p className="m-b5"><strong>Status:</strong> {statusText}</p>
                                                {/* <p className="m-b5"><strong>Created:</strong> {formatAccountDate(detail.createdAt)}</p> */}
                                                {/*  */}
                                              </div>
                                              {/* <{detail.remarks ? (
                                                  <p className="m-b5"><strong>Seller Remark:</strong> {detail.remarks}</p>
                                                ) : null}div className="col-md-12">
                                                <h6>Follow-up History</h6>
                                                {followups.length ? (
                                                  <ul className="list-unstyled m-b0">
                                                    {followups.map((follow, index) => (
                                                      <li key={follow.id || index} className="m-b8">
                                                        <strong>{formatAccountDate(follow.date || follow.createdAt)}:</strong>{' '}
                                                        {(follow.types || []).join(', ') || 'Follow-up'} - {follow.remark || 'No remark'}
                                                      </li>
                                                    ))}
                                                  </ul>
                                                ) : (
                                                  <p className="text-muted m-b0">No follow-up added yet.</p>
                                                )}
                                              </div> */}
                                            </div>
                                          </td>
                                        </tr>
                                      ) : null}
                                    </React.Fragment>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'profile' && (
                      <div>
                        <h4 className="m-b20">Profile Information</h4>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Name</label>
                            <input type="text" className="form-control" value={partnerData.name || ''} readOnly />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Email</label>
                            <div className="d-flex align-items-center">
                              <input type="email" className="form-control" value={partnerData.email || ''} readOnly />
                              {partnerData.email_verified_at && (
                                <span className="badge bg-success m-l10" title="Email Verified">
                                  <i className="fa fa-check-circle"></i> Verified
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Phone</label>
                            <input type="text" className="form-control" value={partnerData.phone || ''} readOnly />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">City</label>
                            <input type="text" className="form-control" value={partnerData.city || ''} readOnly />
                          </div>
                          {partnerData.state && (
                            <div className="col-md-6 mb-3">
                              <label className="form-label">State</label>
                              <input type="text" className="form-control" value={partnerData.state} readOnly />
                            </div>
                          )}
                          {partnerData.country && (
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Country</label>
                              <input type="text" className="form-control" value={partnerData.country} readOnly />
                            </div>
                          )}
                          {partnerData.postal_code && (
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Postal Code</label>
                              <input type="text" className="form-control" value={partnerData.postal_code} readOnly />
                            </div>
                          )}
                          {partnerData.address && (
                            <div className="col-md-12 mb-3">
                              <label className="form-label">Address</label>
                              <textarea className="form-control" rows="3" value={partnerData.address} readOnly />
                            </div>
                          )}
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Join As</label>
                            <input type="text" className="form-control" value={partnerData.join_us || partnerData.joinAs || ''} readOnly />
                          </div>
                          {partnerData.email_verified_at && (
                            <div className="col-md-6 mb-3">
                              <label className="form-label">Email Verified At</label>
                              <input type="text" className="form-control" value={new Date(partnerData.email_verified_at).toLocaleString()} readOnly />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer2 />

      {/* Upload Modal */}
      {showUploadModal && selectedTask && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="modal-content bg-white" style={{ borderRadius: '10px', width: 'min(95vw, 600px)', padding: '30px', position: 'relative' }}>
            <button onClick={() => { setShowUploadModal(false); setUploadFile(null); setSelectedTask(null); }} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>✖</button>
            <h3 className="m-b20">Submit Work - {selectedTask.title}</h3>
            <form onSubmit={handleSubmitWork}>
              <div className="mb-3">
                <label className="form-label">Upload Layout Design *</label>
                <input 
                  type="file" 
                  className="form-control" 
                  accept=".pdf,.jpg,.jpeg,.png,.dwg"
                  multiple
                  onChange={handleFileChange}
                  required
                />
                <small className="text-muted">Accepted formats: PDF, Images, DWG files</small>
              </div>
              <div className="text-right">
                <button type="button" className="site-button-secondry btn-half m-r10" onClick={() => { setShowUploadModal(false); setUploadFile(null); setSelectedTask(null); }}>Cancel</button>
                <button type="submit" className="site-button btn-half" disabled={uploading}>{uploading ? 'Submitting...' : 'Submit for Review'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedQuotationProduct && (
        <ProductDetailModal
          product={selectedQuotationProduct}
          onClose={() => setSelectedQuotationProduct(null)}
        />
      )}
    </>
  );
};

export default PartnerAccount;
