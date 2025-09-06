import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from '../App';
import logo from "../assets/trustlineLOGO.PNG";
import "./styleA.css";

function ComplaintA() {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [expandedComplaints, setExpandedComplaints] = useState({});
  const [filter, setFilter] = useState("all");

  const handleSignOut = () => {
    localStorage.removeItem("currentUser");
    window.dispatchEvent(new Event('storage'));
    navigate("/signin");
  };

  // Load all complaints from localStorage
  useEffect(() => {
    const storedComplaints = JSON.parse(localStorage.getItem("complaints")) || [];
    setComplaints(storedComplaints);
  }, []);

  // Toggle view more for a specific complaint
  const toggleViewMore = (complaintId) => {
    setExpandedComplaints(prev => ({
      ...prev,
      [complaintId]: !prev[complaintId]
    }));
  };

  // Handle complaint deletion
  const handleDeleteComplaint = (complaintId) => {
    if (window.confirm("Are you sure you want to delete this complaint? This action cannot be undone.")) {
      // Filter out the complaint to delete
      const updatedComplaints = complaints.filter(complaint => complaint.id !== complaintId);
      
      // Update localStorage
      localStorage.setItem("complaints", JSON.stringify(updatedComplaints));
      
      // Update state
      setComplaints(updatedComplaints);
      
      // Remove from expanded view if it was expanded
      setExpandedComplaints(prev => {
        const newExpanded = {...prev};
        delete newExpanded[complaintId];
        return newExpanded;
      });
      
      alert("Complaint deleted successfully!");
    }
  };

  // Handle sending Aadhaar to helper
  const handleSendAadhaar = (complaint) => {
    // Get all users from localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];
    
    // Find the client user to get their Aadhaar
    const clientUser = users.find(user => user.code === complaint.userCode);
    
    if (!clientUser || !clientUser.aadhar) {
      alert("Aadhaar information not found for this client.");
      return;
    }
    
    // Find the helper user who is assigned to this complaint
    const helperUser = users.find(user => user.username === complaint.assignedTo);
    
    if (!helperUser) {
      alert("Helper information not found for this complaint.");
      return;
    }
    
    // In a real application, you would send this information securely
    // For this demo, we'll just show an alert with the information
    alert(`Aadhaar information sent to helper ${complaint.assignedTo}:\n\nClient: ${complaint.userName} (${complaint.userCode})\nAadhaar: ${clientUser.aadhar}`);
    
    // You could also store this action in localStorage for tracking
    const aadhaarLogs = JSON.parse(localStorage.getItem("aadhaarLogs")) || [];
    aadhaarLogs.push({
      complaintId: complaint.id,
      complaintNumber: complaint.complaintNumber,
      clientCode: complaint.userCode,
      clientName: complaint.userName,
      helper: complaint.assignedTo,
      aadhaar: clientUser.aadhar,
      sentAt: new Date().toISOString(),
      sentBy: currentUser.username
    });
    localStorage.setItem("aadhaarLogs", JSON.stringify(aadhaarLogs));
  };

  // Filter complaints based on status
  const filteredComplaints = filter === "all" 
    ? complaints 
    : complaints.filter(complaint => complaint.status === filter);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch(status) {
      case "pending": return "danger";
      case "working": return "warning";
      case "solved": return "success";
      case "reported": return "info";
      default: return "secondary";
    }
  };

  // Render evidence preview based on type
  const renderEvidencePreview = (complaint) => {
    if (!complaint.evidenceFile) {
      return <p className="text-muted">No evidence file uploaded</p>;
    }
    
    switch(complaint.evidenceType) {
      case "photo":
        return <img src={complaint.evidenceFile} alt="Evidence" className="img-fluid rounded" style={{maxHeight: '300px'}} />;
      case "video":
        return <video controls className="w-100 rounded" style={{maxHeight: '300px'}}>
          <source src={complaint.evidenceFile} type="video/mp4" />
          Your browser does not support the video tag.
        </video>;
      case "audio":
        return <audio controls className="w-100">
          <source src={complaint.evidenceFile} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>;
      case "document":
        return <div className="alert alert-info">
          <i className="bi bi-file-earmark-text me-2"></i>
          Document uploaded: <a href={complaint.evidenceFile} target="_blank" rel="noopener noreferrer">View Document</a>
        </div>;
      default:
        return <div className="alert alert-info">
          <i className="bi bi-file-earmark me-2"></i>
          File uploaded: <a href={complaint.evidenceFile} target="_blank" rel="noopener noreferrer">Download File</a>
        </div>;
    }
  };

  return (
    <>
      {/* Navbar - Admin */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-custom px-4">
        <Link className="navbar-brand d-flex align-items-center" to="/homeA">
          <img src={logo} alt="Logo" className="navbar-logo" />
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto ms-3">
            <li className="nav-item"><Link className="nav-link" to="/homeA">Home</Link></li>
            <li className="nav-item"><Link className="nav-link active" to="/complaintA">Complaint</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/chatA">Chat</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/aboutA">About</Link></li>
          </ul>
          <ul className="navbar-nav">
            <li className="nav-item">
              <button className="btn btn-danger fw-bold" onClick={handleSignOut}>Sign Out</button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Complaint Content */}
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>All Complaints</h2>
              <div>
                <span className="badge bg-info me-2">
                  Total: {complaints.length}
                </span>
              </div>
            </div>

            {/* Filter Options */}
            <div className="btn-group mb-4 w-100" role="group">
              <button 
                type="button" 
                className={`btn ${filter === "all" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setFilter("all")}
              >
                All
              </button>
              <button 
                type="button" 
                className={`btn ${filter === "pending" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setFilter("pending")}
              >
                Pending
              </button>
              <button 
                type="button" 
                className={`btn ${filter === "working" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setFilter("working")}
              >
                Working
              </button>
              <button 
                type="button" 
                className={`btn ${filter === "solved" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setFilter("solved")}
              >
                Solved
              </button>
              <button 
                type="button" 
                className={`btn ${filter === "reported" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setFilter("reported")}
              >
                Reported
              </button>
            </div>

            {/* Complaints List */}
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-5">
                <div className="card">
                  <div className="card-body py-5">
                    <i className="bi bi-inbox display-1 text-muted"></i>
                    <h3 className="mt-3">No Complaints Found</h3>
                    <p className="text-muted">
                      {filter === "all" 
                        ? "There are no complaints in the system." 
                        : `There are no ${filter} complaints.`}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {filteredComplaints.map(complaint => (
                  <div key={complaint.id} className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Complaint #: {complaint.complaintNumber}</strong>
                        <span className="ms-3 badge bg-secondary">{complaint.category}</span>
                        <span className={`ms-2 badge bg-${getStatusColor(complaint.status)}`}>
                          {complaint.status.toUpperCase()}
                        </span>
                      </div>
                      <small className="text-muted">{formatDate(complaint.date)}</small>
                    </div>
                    <div className="card-body">
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <strong>Client:</strong> {complaint.userName} ({complaint.userCode})
                        </div>
                        <div className="col-md-6">
                          <strong>Assigned to:</strong> {complaint.assignedTo}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <strong>Description:</strong>
                        <p className="mt-1">{complaint.description}</p>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>Evidence Type:</strong> {complaint.evidenceType}
                        </div>
                        
                        {/* View More Button */}
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => toggleViewMore(complaint.id)}
                        >
                          {expandedComplaints[complaint.id] ? 'View Less' : 'View More Details'}
                        </button>
                      </div>

                      {/* Expanded Content */}
                      {expandedComplaints[complaint.id] && (
                        <div className="mt-3 p-3 border rounded">
                          <h6>Complete Complaint Details:</h6>
                          
                          <div className="row mb-3">
                            <div className="col-md-6">
                              <strong>Complaint ID:</strong> {complaint.id}
                            </div>
                            <div className="col-md-6">
                              <strong>Complaint Number:</strong> {complaint.complaintNumber}
                            </div>
                          </div>
                          
                          <div className="row mb-3">
                            <div className="col-md-6">
                              <strong>Client Username:</strong> {complaint.userName}
                            </div>
                            <div className="col-md-6">
                              <strong>Client Code:</strong> {complaint.userCode}
                            </div>
                          </div>
                          
                          <div className="row mb-3">
                            <div className="col-md-6">
                              <strong>Assigned To:</strong> {complaint.assignedTo}
                            </div>
                            <div className="col-md-6">
                              <strong>Status:</strong> 
                              <span className={`badge bg-${getStatusColor(complaint.status)} ms-2`}>
                                {complaint.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="row mb-3">
                            <div className="col-md-6">
                              <strong>Category:</strong> {complaint.category}
                            </div>
                            <div className="col-md-6">
                              <strong>Evidence Type:</strong> {complaint.evidenceType}
                            </div>
                          </div>
                          
                          <div className="row mb-3">
                            <div className="col-md-6">
                              <strong>Submitted Date:</strong> {formatDate(complaint.date)}
                            </div>
                            <div className="col-md-6">
                              {complaint.assignedAt && (
                                <span>
                                  <strong>Assigned Date:</strong> {formatDate(complaint.assignedAt)}
                                </span>
                              )}
                              {complaint.reportedAt && (
                                <span>
                                  <strong>Reported Date:</strong> {formatDate(complaint.reportedAt)}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {complaint.suspect && (
                            <div className="mb-3">
                              <strong>Suspect Information:</strong>
                              <p className="mt-1">{complaint.suspect}</p>
                            </div>
                          )}
                          
                          <div className="mb-3">
                            <strong>Full Description:</strong>
                            <p className="mt-1">{complaint.description}</p>
                          </div>
                          
                          <div className="mb-3">
                            <strong>Evidence Preview:</strong>
                            <div className="mt-2">
                              {renderEvidencePreview(complaint)}
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="d-flex gap-2 mt-3 flex-wrap">
                            {/* Send Aadhaar Button - Only for reported complaints */}
                            {complaint.status === "reported" && (
                              <button 
                                className="btn btn-info btn-sm"
                                onClick={() => handleSendAadhaar(complaint)}
                              >
                                Send Aadhaar to Helper
                              </button>
                            )}
                            
                            {/* Delete Button */}
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteComplaint(complaint.id)}
                            >
                              Delete Complaint
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ComplaintA;