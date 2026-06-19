import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header2 from '../Common/Header2';
import Footer2 from '../Common/Footer2';
import Banner from '../Elements/Banner';

const bannerImg = require('./../../images/banner/10.jpg');
const bgimg2 = require('./../../images/background/cross-line2.png');

const PartnerAccount = () => {
  const navigate = useNavigate();
  const [partnerData, setPartnerData] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');
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

  useEffect(() => {
    // Check if partner is logged in
    const authData = localStorage.getItem('infrioAuth');
    if (!authData) {
      navigate('/login');
      return;
    }

    const auth = JSON.parse(authData);
    if (auth.role !== 'partner') {
      navigate('/user-account');
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
            const partner = JSON.parse(partnerInfo);
            userId = partner.id;
          }
        }

        if (!userId) {
          // If no userId available, use localStorage data
          const partnerInfo = localStorage.getItem('partnerInfo');
          if (partnerInfo) {
            setPartnerData(JSON.parse(partnerInfo));
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
            setPartnerData(JSON.parse(partnerInfo));
          }
        }
      } catch (error) {
        console.error('Error fetching partner details:', error);
        // Fallback to localStorage if API fails
        const partnerInfo = localStorage.getItem('partnerInfo');
        if (partnerInfo) {
          setPartnerData(JSON.parse(partnerInfo));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPartnerDetails();

    fetchAvailableTasks();
    fetchMyTasks();
  }, [navigate]);

  const fetchAvailableTasks = async () => {
    try {
      setAvailableLoading(true);
      setAvailableError(null);
      const response = await fetch('https://www.admin.infrioindia.com/api/v2/auth/architecture-accept-form-all', {
        method: 'GET'
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
      const auth = authData ? JSON.parse(authData) : null;
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
    localStorage.removeItem('infrioAuth');
    localStorage.removeItem('partnerInfo');
    navigate('/login');
  };

  const handleAcceptTask = async (task) => {
    try {
      const authData = localStorage.getItem('infrioAuth');
      const auth = authData ? JSON.parse(authData) : null;
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
        alert(result.message || 'Task accepted successfully');
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
      const auth = authData ? JSON.parse(authData) : null;
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
        alert(result.message || 'Work submitted successfully!');
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
                        className={`nav-link ${activeTab === 'tasks' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tasks')}
                        style={{ border: 'none', background: 'transparent', padding: '10px 20px', cursor: 'pointer' }}
                      >
                        My Tasks ({myTasks.length})
                      </button>
                    </li>
                    <li className="nav-item">
                      <button 
                        className={`nav-link ${activeTab === 'available' ? 'active' : ''}`}
                        onClick={() => setActiveTab('available')}
                        style={{ border: 'none', background: 'transparent', padding: '10px 20px', cursor: 'pointer' }}
                      >
                        Available Tasks ({availableTasks.length})
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
                                      <h5 className="m-b5">Task #{task.id}</h5>
                                      <span className={`badge ${task.status === 2 ? 'bg-warning' : task.status === 1 ? 'bg-info' : 'bg-secondary'}`}>
                                        {task.status_text || (task.status === 2 ? 'Accepted' : task.status === 1 ? 'Submitted' : 'Pending')}
                                      </span>
                                    </div>
                                  </div>
                                  <ul className="list-unstyled text-muted small m-b10">
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
                                    {task.client_phone && <li><strong>Client Phone:</strong> {task.client_phone}</li>}
                                    {task.created_at && <li><strong>Created:</strong> {task.created_at}</li>}
                                  </ul>
                                  {task.status === 2 && (
                                    <button 
                                      className="site-button btn-sm"
                                      onClick={() => handleUploadClick(task)}
                                    >
                                      Upload & Submit Work
                                    </button>
                                  )}
                                  {task.status === 1 && (
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
                                      <h5 className="m-b5">Architecture Request #{task.id}</h5>
                                      <span className="badge bg-success">Available</span>
                                    </div>
                                  </div>
                                  <ul className="list-unstyled text-muted small m-b10">
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
                                    {task.created_at && <li><strong>Created:</strong> {task.created_at}</li>}
                                  </ul>
                                  <p className="text-muted m-b10"><small>Status: {task.status_text || (task.status !== undefined ? task.status : 'N/A')}</small></p>
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
    </>
  );
};

export default PartnerAccount;