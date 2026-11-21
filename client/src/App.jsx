import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardPage from './pages/DashboardPage';
import MyComplaintsPage from './pages/MyComplaintsPage';
import ReportComplaintPage from './pages/ReportComplaintPage';
import ComplaintModal from './components/common/ComplaintModal';
import Toast from './components/common/Toast';
import { api } from './services/api';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [toast, setToast] = useState({
    message: 'Connecting to NIVARA Live Backend...',
    type: 'success'
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Fetch all complaints from real Flask backend
  const fetchComplaints = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setFetchError(null);

    try {
      const data = await api.getComplaints();
      console.log(`[NIVARA Frontend] Successfully retrieved ${data.length} complaint(s):`, data);
      setComplaints(data);
      if (!silent) {
        setToast({
          message: `Connected to MongoDB Atlas. Loaded ${data.length} live complaint(s).`,
          type: 'success'
        });
      }
    } catch (err) {
      console.error('[NIVARA Frontend] Error fetching complaints from backend:', err);
      const msg = err.message || 'Cannot reach backend server';
      setFetchError(msg);
      setToast({
        message: `Backend Connection Notice: ${msg}. Check if Flask server is running.`,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch complaints on initial mount
  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Handle complaint creation via POST /api/complaints
  const handleAddComplaint = async (newComplaintPayload) => {
    try {
      const created = await api.createComplaint(newComplaintPayload);
      // Refresh the complaints list from backend
      await fetchComplaints(true);
      setActiveTab('dashboard');
      setToast({
        message: `Complaint #${created.complaint_id || created.id} lodged successfully and saved to MongoDB!`,
        type: 'success'
      });
    } catch (err) {
      console.error('Error creating complaint:', err);
      throw err;
    }
  };

  // Handle status update via PATCH /api/complaints/<id>/status
  const handleStatusUpdate = async (complaintId, newStatus, resolutionNote) => {
    try {
      const updated = await api.updateComplaintStatus(complaintId, newStatus, resolutionNote);
      // Refresh complaints list
      await fetchComplaints(true);

      // Update currently active modal if open
      if (selectedComplaint && (selectedComplaint.id === complaintId || selectedComplaint.complaint_id === complaintId)) {
        setSelectedComplaint(updated);
      }

      setToast({
        message: `Status for complaint #${complaintId} updated to '${newStatus}'!`,
        type: 'success'
      });
      return updated;
    } catch (err) {
      console.error('Error updating complaint status:', err);
      setToast({
        message: `Failed to update status: ${err.message}`,
        type: 'error'
      });
      throw err;
    }
  };

  // Upvote / Endorse a civic complaint (local state endorsement)
  const handleUpvote = (complaintId) => {
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === complaintId || c.complaint_id === complaintId) {
          return { ...c, votes: (c.votes || 0) + 1 };
        }
        return c;
      })
    );

    if (selectedComplaint && (selectedComplaint.id === complaintId || selectedComplaint.complaint_id === complaintId)) {
      setSelectedComplaint(prev => ({
        ...prev,
        votes: (prev.votes || 0) + 1
      }));
    }

    setToast({
      message: `You endorsed issue #${complaintId}. Civic urgency score updated!`,
      type: 'success'
    });
  };

  // Switch to report page
  const handleReportClick = () => {
    setActiveTab('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pendingComplaintsCount = complaints.filter(c =>
    (c.status || '').toLowerCase().includes('pending') || (c.status || '').toLowerCase().includes('submitted')
  ).length;

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCount={pendingComplaintsCount}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="app-main-content">
        {/* Top Header */}
        <Header
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onReportClick={handleReportClick}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* View Routing */}
        <main className="app-page-wrapper">
          {activeTab === 'dashboard' && (
            <DashboardPage
              complaints={complaints}
              isLoading={isLoading}
              fetchError={fetchError}
              onRetry={() => fetchComplaints()}
              onSelectComplaint={setSelectedComplaint}
              onReportClick={handleReportClick}
              searchTerm={searchTerm}
            />
          )}

          {activeTab === 'my-complaints' && (
            <MyComplaintsPage
              complaints={complaints}
              isLoading={isLoading}
              fetchError={fetchError}
              onRetry={() => fetchComplaints()}
              onSelectComplaint={setSelectedComplaint}
              onReportClick={handleReportClick}
              searchTerm={searchTerm}
            />
          )}

          {activeTab === 'report' && (
            <ReportComplaintPage
              onSubmitComplaint={handleAddComplaint}
              onCancel={() => setActiveTab('dashboard')}
            />
          )}
        </main>
      </div>

      {/* Complaint Detail & Status Update Modal */}
      {selectedComplaint && (
        <ComplaintModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onUpvote={handleUpvote}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      {/* System Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
