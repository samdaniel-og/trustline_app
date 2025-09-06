import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/trustlineLOGO.PNG";
import "./styleC.css";

function ChatC() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");
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
    
    // Filter chats for this specific client
    const clientChats = storedChats.filter(chat => chat.clientCode === currentUser.code);
    
    setChats(clientChats);
    setMessages(storedMessages);
  }, [currentUser]);

  // Handle sending a new message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeChat) return;

    const message = {
      id: Date.now(),
      sender: currentUser.username,
      text: newMessage,
      timestamp: new Date().toISOString(),
      type: "text"
    };

    // Update messages for active chat
    const updatedMessages = {
      ...messages,
      [activeChat.id]: [...(messages[activeChat.id] || []), message]
    };
    
    setMessages(updatedMessages);
    localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));

    // Update chat list with last message
    const updatedChats = chats.map(chat => {
      if (chat.id === activeChat.id) {
        return {
          ...chat,
          lastMessage: newMessage.length > 30 ? newMessage.substring(0, 30) + "..." : newMessage,
          lastMessageTime: new Date().toISOString()
        };
      }
      return chat;
    });
    
    setChats(updatedChats);
    localStorage.setItem("chats", JSON.stringify(updatedChats));

    setNewMessage("");
  };

  // Handle sending media
  const handleSendMedia = (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const message = {
        id: Date.now(),
        sender: currentUser.username,
        text: "",
        media: e.target.result,
        mediaType: file.type.startsWith('image/') ? 'image' : 
                  file.type.startsWith('video/') ? 'video' : 'document',
        timestamp: new Date().toISOString(),
        type: "media"
      };

      // Update messages for active chat
      const updatedMessages = {
        ...messages,
        [activeChat.id]: [...(messages[activeChat.id] || []), message]
      };
      
      setMessages(updatedMessages);
      localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));

      // Update chat list with last message
      const updatedChats = chats.map(chat => {
        if (chat.id === activeChat.id) {
          return {
            ...chat,
            lastMessage: `Sent a ${file.type.startsWith('image/') ? 'photo' : 
                         file.type.startsWith('video/') ? 'video' : 'document'}`,
            lastMessageTime: new Date().toISOString()
          };
        }
        return chat;
      });
      
      setChats(updatedChats);
      localStorage.setItem("chats", JSON.stringify(updatedChats));
    };
    reader.readAsDataURL(file);
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
            <li className="nav-item"><Link className="nav-link" to="/complaintC">Complaint</Link></li>
            <li className="nav-item"><Link className="nav-link active" to="/chatC">Chat</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/aboutC">About</Link></li>
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
          {/* Chat List Sidebar */}
          <div className="col-md-4 col-lg-3 border-end">
            <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
              <h5 className="mb-0">Chats</h5>
              <span className="badge bg-primary">{chats.length}</span>
            </div>
            
            <div className="chat-list" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
              {chats.length === 0 ? (
                <div className="text-center p-5">
                  <p className="text-muted">No chats yet</p>
                  <small>A helper will start a chat with you when assigned to your case</small>
                </div>
              ) : (
                chats.map(chat => (
                  <div 
                    key={chat.id} 
                    className={`chat-item p-3 border-bottom ${activeChat?.id === chat.id ? 'bg-light' : ''}`}
                    onClick={() => setActiveChat(chat)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h6 className="mb-1">Helper: {chat.assignedTo || "Support"}</h6>
                        <p className="mb-1 text-muted small">Case: {chat.category}</p>
                        <p className="mb-0 text-muted small">{chat.lastMessage}</p>
                      </div>
                      <div className="text-end">
                        <small className="text-muted">{formatDate(chat.lastMessageTime)}</small>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="col-md-8 col-lg-9">
            {activeChat ? (
              <div className="d-flex flex-column h-100">
                {/* Chat Header */}
                <div className="border-bottom p-3 bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-0">Helper: {activeChat.assignedTo || "Support"}</h5>
                      <small className="text-muted">Case: {activeChat.category}</small>
                    </div>
                    <div>
                      <Link 
                        to="/complaintC" 
                        className="btn btn-outline-primary btn-sm me-2"
                        onClick={() => {
                          // Store the complaint data to view in complaint page
                          const complaints = JSON.parse(localStorage.getItem("complaints")) || [];
                          const complaint = complaints.find(c => c.id === activeChat.complaintId);
                          if (complaint) {
                            localStorage.setItem("viewComplaint", JSON.stringify(complaint));
                          }
                        }}
                      >
                        View My Case
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div 
                  className="flex-grow-1 p-3" 
                  style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 300px)' }}
                >
                  {messages[activeChat.id]?.length === 0 ? (
                    <div className="text-center p-5">
                      <p className="text-muted">No messages yet</p>
                      <small>Start the conversation</small>
                    </div>
                  ) : (
                    messages[activeChat.id]?.map(message => (
                      <div 
                        key={message.id} 
                        className={`d-flex mb-3 ${message.sender === currentUser.username ? 'justify-content-end' : 'justify-content-start'}`}
                      >
                        <div 
                          className={`p-3 rounded ${message.sender === currentUser.username ? 'bg-success text-white' : 'bg-primary text-white'}`}
                          style={{ maxWidth: '70%' }}
                        >
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
                          <small className={`d-block text-end ${message.sender === currentUser.username ? 'text-white-50' : 'text-white-50'}`}>
                            {formatTime(message.timestamp)}
                          </small>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div className="border-top p-3">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <label className="btn btn-outline-secondary">
                      <i className="bi bi-paperclip"></i>
                      <input
                        type="file"
                        style={{ display: 'none' }}
                        accept="image/*,video/*,.pdf,.doc,.docx"
                        onChange={handleSendMedia}
                      />
                    </label>
                    <button 
                      className="btn btn-primary" 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="d-flex justify-content-center align-items-center h-100">
                <div className="text-center">
                  <i className="bi bi-chat-dots display-1 text-muted"></i>
                  <h3 className="mt-3">No Chat Selected</h3>
                  <p className="text-muted">Select a chat from the list or wait for a helper to start a conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ChatC;