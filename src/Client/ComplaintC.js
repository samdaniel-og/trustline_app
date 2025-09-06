import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from '../App';
import logo from "../assets/trustlineLOGO.PNG";
import "./styleC.css";

function ComplaintC() {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedComplaints, setExpandedComplaints] = useState({});
  const [formData, setFormData] = useState({
    category: "Financial Fraud",
    description: "",
    suspect: "",
    evidenceType: "photo",
    evidenceFile: null
  });

  const handleSignOut = () => {
    localStorage.removeItem("currentUser");
    window.dispatchEvent(new Event('storage'));
    navigate("/signin");
  };

  // Load current user's complaints from localStorage
  useEffect(() => {
    const storedComplaints = JSON.parse(localStorage.getItem("complaints")) || [];
    const userComplaints = storedComplaints.filter(
      complaint => complaint.userCode === currentUser.code
    );
    setComplaints(userComplaints);
  }, [currentUser]);

  // Toggle view more for a specific complaint
  const toggleViewMore = (complaintId) => {
    setExpandedComplaints(prev => ({
      ...prev,
      [complaintId]: !prev[complaintId]
    }));
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle file input changes
  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      evidenceFile: e.target.files[0]
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      alert("Please provide a description of the complaint");
      return;
    }

    // Get all complaints to generate the next complaint number
    const allComplaints = JSON.parse(localStorage.getItem("complaints")) || [];
    const complaintNumber = String(allComplaints.length + 1).padStart(3, '0');
    
    const newComplaint = {
      id: Date.now(),
      complaintNumber: complaintNumber,
      userCode: currentUser.code,
      userName: currentUser.username,
      date: new Date().toISOString(),
      category: formData.category,
      description: formData.description,
      suspect: formData.suspect,
      evidenceType: formData.evidenceType,
      status: "pending",
      assignedTo: "Not assigned yet",
      evidenceFile: formData.evidenceFile ? URL.createObjectURL(formData.evidenceFile) : null
    };

    // Update complaints in state and localStorage
    const updatedComplaints = [...allComplaints, newComplaint];
    localStorage.setItem("complaints", JSON.stringify(updatedComplaints));
    
    // Update state with user's complaints only
    const userComplaints = updatedComplaints.filter(
      complaint => complaint.userCode === currentUser.code
    );
    setComplaints(userComplaints);
    
    // Reset form and hide it
    setFormData({
      category: "Financial Fraud",
      description: "",
      suspect: "",
      evidenceType: "photo",
      evidenceFile: null
    });
    setShowForm(false);

    alert("Complaint submitted successfully!");
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
      
      // Update state with user's complaints only
      const userComplaints = updatedComplaints.filter(
        complaint => complaint.userCode === currentUser.code
      );
      setComplaints(userComplaints);
      
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
      case "pending": return "danger"; // red
      case "working": return "warning"; // yellow
      case "solved": return "success"; // green
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
      {/* Navbar - Client */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-custom px-4">
        <Link className="navbar-brand d-flex align-items-center" to="/homeC">
          <img src={logo} alt="Logo" className="navbar-logo" />
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto ms-3">
            <li className="nav-item"><Link className="nav-link" to="/homeC">Home</Link></li>
            <li className="nav-item"><Link className="nav-link active" to="/complaintC">Complaint</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/chatC">Chat</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/aboutC">About</Link></li>
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
              <h2>My Complaints</h2>
              <button 
                className="btn btn-primary"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? "Cancel" : "Add Complaint"}
              </button>
            </div>

            {/* Complaint Form */}
            {showForm && (
              <div className="card mb-4">
                <div className="card-header bg-primary text-white">
                  <h4>Submit New Complaint</h4>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="category" className="form-label">Category *</label>
                        <select
                          className="form-select"
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="Financial Fraud">Financial Fraud</option>
                          <option value="Online Harassment">Online Harassment</option>
                          <option value="Identity Theft">Identity Theft</option>
                          <option value="Cyberbullying">Cyberbullying</option>
                          <option value="Data Breach">Data Breach</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="evidenceType" className="form-label">Evidence Type</label>
                        <select
                          className="form-select"
                          id="evidenceType"
                          name="evidenceType"
                          value={formData.evidenceType}
                          onChange={handleInputChange}
                        >
                          <option value="photo">Photo</option>
                          <option value="video">Video</option>
                          <option value="audio">Audio</option>
                          <option value="document">Document</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="suspect" className="form-label">Suspect Information (if known)</label>
                      <input
                        type="text"
                        className="form-control"
                        id="suspect"
                        name="suspect"
                        placeholder="Name, contact info, or other identifying details"
                        value={formData.suspect}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="description" className="form-label">Description *</label>
                      <textarea
                        className="form-control"
                        id="description"
                        name="description"
                        rows="4"
                        placeholder="Please provide a detailed description of the incident..."
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="evidenceFile" className="form-label">Upload Evidence</label>
                      <input
                        type="file"
                        className="form-control"
                        id="evidenceFile"
                        onChange={handleFileChange}
                        accept={formData.evidenceType === 'photo' ? 'image/*' : 
                                formData.evidenceType === 'video' ? 'video/*' : 
                                formData.evidenceType === 'audio' ? 'audio/*' : '*/*'}
                      />
                    </div>

                    <button type="submit" className="btn btn-success">Submit Complaint</button>
                  </form>
                </div>
              </div>
            )}

            {/* Complaints List */}
            {complaints.length === 0 ? (
              <div className="text-center py-5">
                <div className="card">
                  <div className="card-body py-5">
                    <i className="bi bi-inbox display-1 text-muted"></i>
                    <h3 className="mt-3">No Complaints Yet</h3>
                    <p className="text-muted">You haven't submitted any complaints yet.</p>
                    <button 
                      className="btn btn-primary mt-2"
                      onClick={() => setShowForm(true)}
                    >
                      Submit Your First Complaint
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {complaints.map(complaint => (
                  <div key={complaint.id} className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Complaint #: {complaint.complaintNumber}</strong>
                        <span className="ms-3 badge bg-secondary">{complaint.category}</span>
                      </div>
                      <small className="text-muted">{formatDate(complaint.date)}</small>
                    </div>
                    <div className="card-body">
                      <div className="d-flex justify-content-between mb-2">
                        <div>
                          <strong>Client:</strong> {complaint.userName} ({complaint.userCode})
                        </div>
                        <div>
                          <strong>Assigned to:</strong> {complaint.assignedTo}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <strong>Description:</strong>
                        <p className="mt-1">{complaint.description}</p>
                      </div>
                      
                      {complaint.suspect && (
                        <div className="mb-3">
                          <strong>Suspect Information:</strong>
                          <p className="mt-1">{complaint.suspect}</p>
                        </div>
                      )}
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>Evidence Type:</strong> {complaint.evidenceType}
                        </div>
                        <span className={`badge bg-${getStatusColor(complaint.status)}`}>
                          {complaint.status.toUpperCase()}
                        </span>
                      </div>

                      {/* View More Button and Expanded Content */}
                      <div className="mt-3">
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => toggleViewMore(complaint.id)}
                        >
                          {expandedComplaints[complaint.id] ? 'View Less' : 'View More'}
                        </button>
                        
                        {expandedComplaints[complaint.id] && (
                          <div className="mt-3 p-3 border rounded">
                            <h6>Evidence Preview:</h6>
                            {renderEvidencePreview(complaint)}
                            
                            <div className="mt-3">
                              <h6>Full Details:</h6>
                              <p><strong>Submitted:</strong> {formatDate(complaint.date)}</p>
                              <p><strong>Status:</strong> 
                                <span className={`badge bg-${getStatusColor(complaint.status)} ms-2`}>
                                  {complaint.status.toUpperCase()}
                                </span>
                              </p>
                              
                              {/* REMOVED: Complaint ID display */}
                              
                              {/* Delete Button - Only show for pending complaints */}
                              {complaint.status === "pending" && (
                                <button 
                                  className="btn btn-danger btn-sm mt-2"
                                  onClick={() => handleDeleteComplaint(complaint.id)}
                                >
                                  Delete Complaint
                                </button>
                              )}
                              {complaint.status !== "pending" && (
                                <p className="text-muted mt-2">
                                  <i className="bi bi-info-circle me-1"></i>
                                  This complaint cannot be deleted because its status is "{complaint.status}".
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
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

export default ComplaintC;