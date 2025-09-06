import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/trustlineLOGO.PNG";
import "./styleA.css";

function ChatA() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [currentUser] = useState(JSON.parse(localStorage.getItem("currentUser")));

  const handleSignOut = () => {
    localStorage.removeItem("currentUser");
    window.dispatchEvent(new Event('storage'));
    navigate("/signin");
  };

  // Load chats and messages from localStorage
  useEffect(() => {
    const storedChats = JSON.parse(localStorage.getItem("chats")) || [];
    const storedMessages = JSON.parse(localStorage.getItem("chatMessages")) || {};
    
    // Admin can see all chats
    setChats(storedChats);
    setMessages(storedMessages);
  }, []);

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

  // Get case status from complaints
  const getCaseStatus = (complaintId) => {
    const complaints = JSON.parse(localStorage.getItem("complaints")) || [];
    const complaint = complaints.find(c => c.id === complaintId);
    return complaint ? complaint.status : "unknown";
  };

  // Format time for display
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Format date for chat list
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    
    return date.toLocaleDateString();
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
            <li className="nav-item"><Link className="nav-link" to="/complaintA">Complaint</Link></li>
            <li className="nav-item"><Link className="nav-link active" to="/chatA">Chat</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/aboutA">About</Link></li>
          </ul>
          <ul className="navbar-nav">
            <li className="nav-item">
              <button className="btn btn-danger fw-bold" onClick={handleSignOut}>Sign Out</button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Chat Content */}
      <div className="container-fluid mt-4 h-100">
        <div className="row h-100">
          {/* Chat List Sidebar - Wider for admin */}
          <div className="col-md-5 col-lg-4 border-end">
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <h5 className="mb-0">All Chats</h5>
              <span className="badge bg-primary">{chats.length}</span>
            </div>
            
            <div className="chat-list" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
              {chats.length === 0 ? (
                <div className="text-center p-5">
                  <p className="text-muted">No chats yet</p>
                  <small>Chats will appear when helpers start conversations with clients</small>
                </div>
              ) : (
                chats.map(chat => {
                  const caseStatus = getCaseStatus(chat.complaintId);
                  return (
                    <div 
                      key={chat.id} 
                      className={`chat-item p-3 border-bottom ${activeChat?.id === chat.id ? 'bg-light' : ''}`}
                      onClick={() => setActiveChat(chat)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">Client: {chat.clientName} ({chat.clientCode})</h6>
                          <p className="mb-1">Helper: {chat.assignedTo || "Unassigned"}</p>
                        </div>
                        <div className="text-end">
                          <small className="text-muted">{formatDate(chat.lastMessageTime)}</small>
                        </div>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <span className="badge bg-secondary me-2">{chat.category}</span>
                          <span className={`badge bg-${getStatusColor(caseStatus)}`}>
                            {caseStatus.toUpperCase()}
                          </span>
                        </div>
                        <small className="text-muted">{chat.lastMessage}</small>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="col-md-7 col-lg-8">
            {activeChat ? (
              <div className="d-flex flex-column h-100">
                {/* Chat Header */}
                <div className="border-bottom p-3 bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-0">
                        Client: {activeChat.clientName} ({activeChat.clientCode})
                      </h5>
                      <p className="mb-0">Helper: {activeChat.assignedTo || "Unassigned"}</p>
                      <div className="mt-1">
                        <span className="badge bg-secondary me-2">{activeChat.category}</span>
                        <span className={`badge bg-${getStatusColor(getCaseStatus(activeChat.complaintId))}`}>
                          {getCaseStatus(activeChat.complaintId).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Link 
                        to="/complaintA" 
                        className="btn btn-outline-primary btn-sm me-2"
                        onClick={() => {
                          // Store the complaint data to view in admin complaint page
                          const complaints = JSON.parse(localStorage.getItem("complaints")) || [];
                          const complaint = complaints.find(c => c.id === activeChat.complaintId);
                          if (complaint) {
                            localStorage.setItem("viewComplaint", JSON.stringify(complaint));
                          }
                        }}
                      >
                        View Case Details
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Messages Area - Read only for admin */}
                <div 
                  className="flex-grow-1 p-3" 
                  style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}
                >
                  {messages[activeChat.id]?.length === 0 ? (
                    <div className="text-center p-5">
                      <p className="text-muted">No messages yet</p>
                      <small>Monitoring conversation between client and helper</small>
                    </div>
                  ) : (
                    messages[activeChat.id]?.map(message => (
                      <div 
                        key={message.id} 
                        className={`d-flex mb-3 ${message.sender === activeChat.clientName ? 'justify-content-start' : 'justify-content-end'}`}
                      >
                        <div 
                          className={`p-3 rounded ${message.sender === activeChat.clientName ? 'bg-success text-white' : 'bg-primary text-white'}`}
                          style={{ maxWidth: '70%' }}
                        >
                          <small className="d-block mb-1 fw-bold">
                            {message.sender === activeChat.clientName ? 
                              `${activeChat.clientName} (Client)` : 
                              `${message.sender} (Helper)`}
                          </small>
                          
                          {message.type === "media" ? (
                            <div>
                              {message.mediaType === 'image' ? (
                                <img 
                                  src={message.media} 
                                  alt="Shared media" 
                                  className="img-fluid rounded mb-2"
                                  style={{ maxHeight: '200px' }}
                                />
                              ) : message.mediaType === 'video' ? (
                                <video 
                                  controls 
                                  className="img-fluid rounded mb-2"
                                  style={{ maxHeight: '200px' }}
                                >
                                  <source src={message.media} />
                                </video>
                              ) : (
                                <div className="alert alert-info mb-2">
                                  <a href={message.media} download>Download Document</a>
                                </div>
                              )}
                              {message.text && <p className="mb-0">{message.text}</p>}
                            </div>
                          ) : (
                            <p className="mb-0">{message.text}</p>
                          )}
                          <small className="d-block text-end text-white-50">
                            {formatTime(message.timestamp)}
                          </small>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Admin cannot send messages - View only */}
                <div className="border-top p-3 bg-light text-center">
                  <p className="text-muted mb-0">
                    <i className="bi bi-eye-fill me-2"></i>
                    Admin View Only - Monitoring Mode
                  </p>
                </div>
              </div>
            ) : (
              <div className="d-flex justify-content-center align-items-center h-100">
                <div className="text-center">
                  <i className="bi bi-chat-dots display-1 text-muted"></i>
                  <h3 className="mt-3">No Chat Selected</h3>
                  <p className="text-muted">Select a chat from the list to monitor the conversation</p>
                  <div className="mt-3 p-3 bg-light rounded">
                    <h6>Admin Monitoring Features:</h6>
                    <ul className="list-unstyled text-start">
                      <li>• View all client-helper conversations</li>
                      <li>• Monitor chat content and media</li>
                      <li>• See case status and details</li>
                      <li>• Read-only access for compliance</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ChatA;