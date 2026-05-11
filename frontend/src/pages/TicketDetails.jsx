import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Send, User, Shield } from 'lucide-react';

const TicketDetails = () => {
  const [ticket, setTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [replyLoading, setReplyLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const fetchTicketAndReplies = async () => {
      try {
        const [ticketRes, repliesRes] = await Promise.all([
          api.get(`/tickets/${id}`),
          api.get(`/tickets/${id}/replies`)
        ]);
        setTicket(ticketRes.data.data);
        setReplies(repliesRes.data.data);
      } catch (err) {
        console.error('Error fetching ticket data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketAndReplies();
  }, [id]);

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    setReplyLoading(true);
    try {
      const res = await api.post(`/tickets/${id}/replies`, { message: newReply });
      setReplies([...replies, { ...res.data.data, user: { _id: user._id, name: user.name, role: user.role } }]);
      setNewReply('');
    } catch (err) {
      console.error('Error adding reply:', err);
    } finally {
      setReplyLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try {
      const res = await api.put(`/tickets/${id}`, { status: newStatus });
      setTicket(res.data.data);
      // Add a system message to the chat locally
      setReplies(prev => [...prev, {
        _id: 'system-' + Date.now(),
        message: `Status changed to ${newStatus}`,
        isSystem: true,
        createdAt: new Date()
      }]);
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) return <div className="loading"><div className="loading-spinner"></div><span>Opening secure chat channel...</span></div>;
  if (!ticket) return <div>Ticket not found.</div>;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-outline" 
            style={{ padding: '0.5rem', borderRadius: '10px' }}
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{ticket.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-light)' }}>
              <span>ID: #{ticket._id.slice(-6).toUpperCase()}</span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={12} /> {new Date(ticket.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <span className={`badge badge-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
          <span className={`badge badge-${ticket.status.toLowerCase().replace(' ', '-')}`}>{ticket.status}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', height: 'calc(100vh - 200px)', minHeight: '600px' }}>
        {/* Chat Area */}
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ 
            padding: '1rem 1.5rem', 
            borderBottom: '1px solid var(--border)', 
            backgroundColor: 'var(--background)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)', boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.1)' }}></div>
              <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>Live Support Channel</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>Encryption: End-to-End</span>
          </div>

          {/* Messages Timeline */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Original Issue Description as first message */}
            <div style={{ alignSelf: 'center', maxWidth: '80%', marginBottom: '2rem' }}>
              <div style={{ 
                backgroundColor: 'var(--background)', 
                padding: '1.5rem', 
                borderRadius: '1.25rem', 
                border: '1px solid var(--border)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>
                  Initial Issue Report
                </div>
                <p style={{ fontSize: '0.9375rem', lineHeight: '1.6', color: 'var(--text)' }}>{ticket.description}</p>
              </div>
            </div>

            {replies.map((reply, index) => (
              reply.isSystem ? (
                <div key={reply._id} style={{ 
                  alignSelf: 'center', 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  color: 'var(--text-light)', 
                  backgroundColor: 'var(--background)',
                  padding: '0.25rem 1rem',
                  borderRadius: '1rem',
                  margin: '0.5rem 0'
                }}>
                  {reply.message}
                </div>
              ) : (
                <div key={reply._id} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: reply.user.role === 'admin' ? 'flex-start' : 'flex-end',
                  maxWidth: '85%',
                  alignSelf: reply.user.role === 'admin' ? 'flex-start' : 'flex-end'
                }}>
                  <div style={{ 
                    padding: '0.875rem 1.125rem',
                    borderRadius: '1.25rem',
                    fontSize: '0.9375rem',
                    backgroundColor: reply.user.role === 'admin' ? 'var(--surface)' : 'var(--primary)',
                    color: reply.user.role === 'admin' ? 'var(--text)' : 'white',
                    border: reply.user.role === 'admin' ? '1px solid var(--border)' : 'none',
                    boxShadow: reply.user.role === 'admin' ? 'var(--shadow-sm)' : '0 4px 12px -2px rgba(37, 99, 235, 0.25)',
                    borderBottomLeftRadius: reply.user.role === 'admin' ? '0.25rem' : '1.25rem',
                    borderBottomRightRadius: reply.user.role === 'admin' ? '1.25rem' : '0.25rem'
                  }}>
                    {reply.message}
                  </div>
                  <div style={{ 
                    fontSize: '0.6875rem', 
                    color: 'var(--text-light)', 
                    marginTop: '0.375rem',
                    fontWeight: 600,
                    marginRight: reply.user.role === 'admin' ? '0' : '0.5rem',
                    marginLeft: reply.user.role === 'admin' ? '0.5rem' : '0'
                  }}>
                    {reply.user.name} • {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )
            ))}
          </div>

          {/* Chat Input Area */}
          <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
            {isAdmin && (
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-light)', alignSelf: 'center', marginRight: '0.5rem' }}>QUICK RESPONSES:</span>
                {['Working on it', 'Need more info', 'Resolved now'].map(text => (
                  <button 
                    key={text}
                    onClick={() => setNewReply(text)}
                    style={{ 
                      fontSize: '0.6875rem', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '1rem', 
                      border: '1px solid var(--border)', 
                      backgroundColor: 'var(--background)',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    {text}
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={handleAddReply} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <textarea
                  className="form-control"
                  style={{ 
                    minHeight: '44px', 
                    height: '44px',
                    maxHeight: '120px',
                    resize: 'none', 
                    padding: '0.625rem 1rem', 
                    fontSize: '0.9375rem',
                    borderRadius: '1.25rem',
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)'
                  }}
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddReply(e);
                    }
                  }}
                  required
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={replyLoading || !newReply.trim()}
                style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '50%', 
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* Info Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>
              Control Panel
            </h3>
            
            <div className="form-group">
              <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={14} /> Update Status
              </label>
              <select 
                className="form-control" 
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={statusLoading}
                style={{ fontWeight: 700, borderRadius: '10px' }}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', marginTop: '1.5rem', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Requester</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.75rem' }}>
                    {ticket.user.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{ticket.user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{ticket.user.role}</div>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Details</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--text-light)' }}>Category</span>
                    <span style={{ fontWeight: 600 }}>{ticket.category}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--text-light)' }}>Priority</span>
                    <span style={{ fontWeight: 600 }}>{ticket.priority}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <Shield size={20} />
              <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Security Protocol</span>
            </div>
            <p style={{ fontSize: '0.75rem', opacity: 0.9, lineHeight: '1.6' }}>
              This chat is being recorded for quality assurance. Please do not share sensitive credentials like passwords in this channel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


import { MessageSquare } from 'lucide-react';

export default TicketDetails;
