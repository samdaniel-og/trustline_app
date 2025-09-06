import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from '../App';
import logo from "../assets/trustlineLOGO.PNG";
import "./styleH.css";

function ComplaintH() {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [expandedComplaints, setExpandedComplaints] = useState({});
  const [aadhaarLogs, setAadhaarLogs] = useState([]);

  const handleSignOut = () => {
    localStorage.removeItem("currentUser");
    window.dispatchEvent(new Event('storage'));
    navigate("/signin");
  };

  // Load complaints and aadhaar logs from localStorage
  useEffect(() => {
    const storedComplaints = JSON.parse(localStorage.getItem("complaints")) || [];
    const storedAadhaarLogs = JSON.parse(localStorage.getItem("aadhaarLogs")) || [];
    
    // Helpers can see:
    // 1. All unassigned complaints (assignedTo: "Not assigned yet")
    // 2. Complaints assigned to them specifically
    const visibleComplaints = storedComplaints.filter(complaint => 
      complaint.assignedTo === "Not assigned yet" || complaint.assignedTo === currentUser.username
    );
    
    setComplaints(visibleComplaints);
    setAadhaarLogs(storedAadhaarLogs);
  }, [currentUser]);

  // Check if Aadhaar has been sent for a specific complaint
  const hasAadhaarBeenSent = (complaintId) => {
    return aadhaarLogs.some(log => log.complaintId === complaintId && log.helper === currentUser.username);
  };

  // Get Aadhaar number for a specific complaint
  const getAadhaarForComplaint = (complaintId) => {
    const log = aadhaarLogs.find(log => log.complaintId === complaintId && log.helper === currentUser.username);
    return log ? log.aadhaar : null;
  };

  // Toggle view more for a specific complaint
  const toggleViewMore = (complaintId) => {
    setExpandedComplaints(prev => ({
      ...prev,
      [complaintId]: !prev[complaintId]
    }));
  };

  // Handle taking a case and navigating to chat
  const handleTakeCaseAndChat = (complaintId) => {
    const updatedComplaints = complaints.map(complaint => {
      if (complaint.id === complaintId) {
        return {
          ...complaint,
          assignedTo: currentUser.username,
          status: "working",
          assignedAt: new Date().toISOString()
        };
      }
      return complaint;
    });
    
    // Update localStorage
    localStorage.setItem("complaints", JSON.stringify(updatedComplaints));
    
    // Update state
    setComplaints(updatedComplaints);
    
    // Store the complaint data for the chat page
    const complaintData = updatedComplaints.find(c => c.id === complaintId);
    localStorage.setItem("currentChatComplaint", JSON.stringify(complaintData));
    
    // Navigate to chat page
    navigate("/chatH", { 
      state: { 
        complaint: complaintData,
        autoStartChat: true
      }
    });
  };

  // Handle reporting a case to admin
  const handleReportCase = (complaintId) => {
    const updatedComplaints = complaints.map(complaint => {
      if (complaint.id === complaintId) {
        return {
          ...complaint,
          status: "reported",
          reportedAt: new Date().toISOString()
        };
      }
      return complaint;
    });
    
    // Update localStorage
    localStorage.setItem("complaints", JSON.stringify(updatedComplaints));
    
    // Update state
    setComplaints(updatedComplaints);
    
    alert("Case reported to admin successfully!");
  };

  // Handle solving a case
  const handleSolveCase = (complaintId) => {
    const updatedComplaints = complaints.map(complaint => {
      if (complaint.id === complaintId) {
        return {
          ...complaint,
          status: "solved",
          solvedAt: new Date().toISOString()
        };
      }
      return complaint;
    });
    
    // Update localStorage
    localStorage.setItem("complaints", JSON.stringify(updatedComplaints));
    
    // Update solved cases count
    const solvedCases = JSON.parse(localStorage.getItem("solvedCases")) || {};
    const helperSolvedCases = solvedCases[currentUser.username] || 0;
    solvedCases[currentUser.username] = helperSolvedCases + 1;
    localStorage.setItem("solvedCases", JSON.stringify(solvedCases));
    
    // Update state
    setComplaints(updatedComplaints);
    
    alert("Case marked as solved successfully!");
  };

  // Handle complaint deletion
  const handleDeleteComplaint = (complaintId) => {
    if (window.confirm("Are you sure you want to delete this complaint? This action cannot be undone.")) {
      // Get all complaints from localStorage
      const allComplaints = JSON.parse(localStorage.getItem("complaints")) || [];
      
      // Filter out the complaint to delete
      const updatedComplaints = allComplaints.filter(complaint => complaint.id !== complaintId);
      
      // Update localStorage
      localStorage.setItem("complaints", JSON.stringify(updatedComplaints));
      
      // Update state with visible complaints only
      const visibleComplaints = updatedComplaints.filter(complaint => 
        complaint.assignedTo === "Not assigned yet" || complaint.assignedTo === currentUser.username
      );
      setComplaints(visibleComplaints);
      
      // Remove from expanded view if it was expanded
      setExpandedComplaints(prev => {
        const newExpanded = {...prev};
        delete newExpanded[complaintId];
        return newExpanded;
      });
      
      alert("Complaint deleted successfully!");
    }
  };

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
      {/* Navbar - Helper */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-custom px-4">
        <Link className="navbar-brand d-flex align-items-center" to="/homeH">
          <img src={logo} alt="Logo" className="navbar-logo" />
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto ms-3">
            <li className="nav-item"><Link className="nav-link" to="/homeH">Home</Link></li>
            <li className="nav-item"><Link className="nav-link active" to="/complaintH">Complaint</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/chatH">Chat</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/aboutH">About</Link></li>
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
              <h2>Available Cases</h2>
              <div>
                <span className="badge bg-info me-2">
                  Total: {complaints.length}
                </span>
                <span className="badge bg-success">
                  Assigned to me: {complaints.filter(c => c.assignedTo === currentUser.username).length}
                </span>
              </div>
            </div>

            {/* Complaints List */}
            {complaints.length === 0 ? (
              <div className="text-center py-5">
                <div className="card">
                  <div className="card-body py-5">
                    <i className="bi bi-inbox display-1 text-muted"></i>
                    <h3 className="mt-3">No Cases Available</h3>
                    <p className="text-muted">There are no complaints requiring attention at this time.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {complaints.map(complaint => {
                  const aadhaarSent = hasAadhaarBeenSent(complaint.id);
                  const aadhaarNumber = getAadhaarForComplaint(complaint.id);
                  
                  return (
                    <div key={complaint.id} className="card mb-4">
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <div>
                          <strong>Complaint #: {complaint.complaintNumber}</strong>
                          <span className="ms-3 badge bg-secondary">{complaint.category}</span>
                          {complaint.assignedTo !== "Not assigned yet" && (
                            <span className="ms-2 badge bg-info">
                              Assigned to: {complaint.assignedTo}
                            </span>
                          )}
                        </div>
                        <small className="text-muted">{formatDate(complaint.date)}</small>
                      </div>
                      <div className="card-body">
                        <div className="d-flex justify-content-between mb-2">
                          <div>
                            <strong>Client:</strong> {complaint.userName} ({complaint.userCode})
                          </div>
                          <div>
                            <span className={`badge bg-${getStatusColor(complaint.status)}`}>
                              {complaint.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        
                        {/* Aadhaar Information - Displayed before View More */}
                        {aadhaarSent && (
                          <div className="alert alert-info mb-3">
                            <strong>Aadhaar Information Received:</strong>
                            <p className="mb-0 mt-1">{aadhaarNumber}</p>
                            <small className="text-muted">Sent by admin for verification purposes</small>
                          </div>
                        )}
                        
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
                            {expandedComplaints[complaint.id] ? 'View Less' : 'View More'}
                          </button>
                        </div>

                        {/* Expanded Content */}
                        {expandedComplaints[complaint.id] && (
                          <div className="mt-3 p-3 border rounded">
                            <h6>Full Details:</h6>
                            
                            {complaint.suspect && (
                              <div className="mb-3">
                                <strong>Suspect Information:</strong>
                                <p className="mt-1">{complaint.suspect}</p>
                              </div>
                            )}
                            
                            <div className="mb-3">
                              <strong>Evidence Preview:</strong>
                              <div className="mt-2">
                                {renderEvidencePreview(complaint)}
                              </div>
                            </div>
                            
                            <div className="mb-3">
                              <strong>Submitted:</strong> {formatDate(complaint.date)}
                              {complaint.assignedAt && (
                                <span className="ms-3">
                                  <strong>Assigned:</strong> {formatDate(complaint.assignedAt)}
                                </span>
                              )}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="d-flex gap-2 mt-3 flex-wrap">
                              {complaint.assignedTo === "Not assigned yet" ? (
                                <button 
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleTakeCaseAndChat(complaint.id)}
                                >
                                  Take Case & Chat
                                </button>
                              ) : complaint.assignedTo === currentUser.username && complaint.status === "working" ? (
                                <>
                                  <button 
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleSolveCase(complaint.id)}
                                  >
                                    Solve Case
                                  </button>
                                  <button 
                                    className="btn btn-info btn-sm"
                                    onClick={() => handleReportCase(complaint.id)}
                                  >
                                    Report to Admin
                                  </button>
                                  <Link
                                    className="btn btn-warning btn-sm"
                                    to="/chatH"
                                    onClick={() => {
                                      localStorage.setItem("currentChatComplaint", JSON.stringify(complaint));
                                    }}
                                  >
                                    Open Chat
                                  </Link>
                                </>
                              ) : (
                                <button className="btn btn-outline-secondary btn-sm" disabled>
                                  {complaint.assignedTo === currentUser.username 
                                    ? `Case ${complaint.status}` 
                                    : "Assigned to Another Helper"}
                                </button>
                              )}
                              
                              {/* Delete Button - Only show if Aadhaar has been sent */}
                              {aadhaarSent && complaint.assignedTo === currentUser.username && (
                                <button 
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleDeleteComplaint(complaint.id)}
                                >
                                  Delete Case
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ComplaintH;