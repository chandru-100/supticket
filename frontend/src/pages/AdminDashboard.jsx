import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Shield, AlertCircle, CheckCircle, Clock, List, Search, Filter, Users, X } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    highPriorityTickets: 0
  });
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [resolveFeedback, setResolveFeedback] = useState('');
  const [resolveLoading, setResolveLoading] = useState(false);
  const [ticketReplies, setTicketReplies] = useState([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (selectedTicket) {
      setRepliesLoading(true);
      api.get(`/tickets/${selectedTicket._id}/replies`)
        .then(res => setTicketReplies(res.data.data))
        .catch(err => console.error(err))
        .finally(() => setRepliesLoading(false));
    } else {
      setTicketReplies([]);
    }
  }, [selectedTicket]);

  const handleResolveTicket = async (e, ticketId) => {
    e.stopPropagation();
    try {
      const res = await api.put(`/tickets/${ticketId}`, { status: 'Resolved' });
      const updatedTicket = res.data.data;
      setTickets(prev => prev.map(t => t._id === updatedTicket._id ? updatedTicket : t));
      
      // Update stats 
      setStats(prev => ({
        ...prev,
        openTickets: prev.openTickets > 0 ? prev.openTickets - 1 : 0,
        resolvedTickets: prev.resolvedTickets + 1
      }));
    } catch (err) {
      console.error('Error resolving ticket:', err);
    }
  };

  const handleResolveFromModal = async () => {
    if (!selectedTicket) return;
    setResolveLoading(true);
    try {
      if (resolveFeedback.trim()) {
        await api.post(`/tickets/${selectedTicket._id}/replies`, { message: resolveFeedback });
      }
      const res = await api.put(`/tickets/${selectedTicket._id}`, { status: 'Resolved' });
      const updatedTicket = res.data.data;
      
      setTickets(prev => prev.map(t => t._id === updatedTicket._id ? updatedTicket : t));
      
      // Update stats 
      setStats(prev => ({
        ...prev,
        openTickets: prev.openTickets > 0 ? prev.openTickets - 1 : 0,
        resolvedTickets: prev.resolvedTickets + 1
      }));
      
      setSelectedTicket(null);
      setResolveFeedback('');
    } catch (err) {
      console.error('Error resolving ticket:', err);
    } finally {
      setResolveLoading(false);
    }
  };

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, ticketsRes] = await Promise.all([
          api.get('/analytics'),
          api.get('/tickets')
        ]);
        setStats(statsRes.data.data);
        setTickets(ticketsRes.data.data);
        setFilteredTickets(ticketsRes.data.data);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        // If in demo mode, we can pre-fill some dummy data if API fails
        if (user?._id?.startsWith('mock-id-')) {
          const demoStats = {
            totalTickets: 24,
            openTickets: 8,
            inProgressTickets: 6,
            resolvedTickets: 10,
            highPriorityTickets: 5
          };
          const demoTickets = [
            { _id: '1', title: 'Critical Server Failure', user: { name: 'John Doe' }, priority: 'High', status: 'Open', category: 'Technical', createdAt: new Date() },
            { _id: '2', title: 'Payment Gateway Timeout', user: { name: 'Jane Smith' }, priority: 'High', status: 'In Progress', category: 'Payment', createdAt: new Date() },
            { _id: '3', title: 'UI Bug in Navigation', user: { name: 'Bob Wilson' }, priority: 'Low', status: 'Resolved', category: 'Technical', createdAt: new Date() },
            { _id: '4', title: 'New Account Verification', user: { name: 'Alice Brown' }, priority: 'Medium', status: 'Open', category: 'Account', createdAt: new Date() }
          ];
          setStats(demoStats);
          setTickets(demoTickets);
          setFilteredTickets(demoTickets);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [user]);

  useEffect(() => {
    let result = tickets;
    
    if (search) {
      result = result.filter(t => 
        t.title.toLowerCase().includes(search.toLowerCase()) || 
        t.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        t._id.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (statusFilter !== 'All') {
      result = result.filter(t => t.status === statusFilter);
    }
    
    setFilteredTickets(result);
  }, [search, statusFilter, tickets]);

  if (loading) return <div className="loading"><div className="loading-spinner"></div><span>Opening Admin Command Center...</span></div>;

  const chartData = [
    { name: 'Open', value: stats.openTickets, color: '#2563eb' },
    { name: 'In Progress', value: stats.inProgressTickets, color: '#f59e0b' },
    { name: 'Resolved', value: stats.resolvedTickets, color: '#10b981' },
    { name: 'High Priority', value: stats.highPriorityTickets, color: '#ef4444' }
  ];

  const isDemo = user?._id?.startsWith('mock-id-');

  return (
    <div>
      {isDemo && (
        <div style={{ 
          backgroundColor: '#fffbeb', 
          border: '1px solid #fef3c7', 
          color: '#92400e', 
          padding: '0.75rem 1rem', 
          borderRadius: '12px', 
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.875rem',
          fontWeight: 600
        }}>
          <AlertCircle size={18} />
          <span>You are in <strong>Demo Mode</strong>. Data is mocked for UI/UX demonstration. Start MongoDB to use real data.</span>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Command Center</h1>
          <p style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>Monitor and manage system-wide support activity</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ 
            backgroundColor: 'var(--surface)', 
            color: '#b91c1c', 
            padding: '0.5rem 1rem', 
            borderRadius: '10px',
            fontSize: '0.75rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            border: '1px solid #fee2e2',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Shield size={16} />
            ROOT ACCESS
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <StatCard title="Total Tickets" value={stats.totalTickets} icon={<List color="var(--primary)" />} onClick={() => setStatusFilter('All')} />
        <StatCard title="Active Users" value={Math.floor(stats.totalTickets * 1.5)} icon={<Users color="#8b5cf6" />} />
        <StatCard title="Open" value={stats.openTickets} icon={<AlertCircle color="var(--primary)" />} onClick={() => setStatusFilter('Open')} />
        <StatCard title="Resolved" value={stats.resolvedTickets} icon={<CheckCircle color="var(--success)" />} onClick={() => setStatusFilter('Resolved')} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.125rem', fontWeight: 700 }}>Ticket Distribution</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }} barSize={48}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-light)', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-light)', fontSize: 12, fontWeight: 600 }} dx={-10} />
                <Tooltip 
                  cursor={{ fill: 'var(--border)', opacity: 0.4 }} 
                  contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', backgroundColor: 'var(--surface)', fontWeight: 600, color: 'var(--text-primary)' }}
                  itemStyle={{ fontWeight: 700 }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1000}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Urgent Actions</h3>
            <span className="badge badge-high">{tickets.filter(t => t.priority === 'High' && t.status !== 'Resolved').length} High Priority</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tickets.filter(t => t.priority === 'High' && t.status !== 'Resolved').slice(0, 5).map(ticket => (
              <div 
                key={ticket._id} 
                onClick={() => setSelectedTicket(ticket)} 
                style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
              >
                <div style={{ 
                  padding: '1rem', 
                  borderRadius: '0.75rem', 
                  backgroundColor: '#fef2f2', 
                  border: '1px solid #fee2e2',
                  transition: 'transform 0.2s'
                }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{ticket.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#991b1b', display: 'flex', justifyContent: 'space-between' }}>
                    <span>From: {ticket.user.name}</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
            {tickets.filter(t => t.priority === 'High' && t.status !== 'Resolved').length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-light)' }}>
                <CheckCircle size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.875rem' }}>All high priority tickets resolved!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recent Activity</h2>
      </div>

      {/* Filters Area */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search by title, user, or ID..." 
            style={{ paddingLeft: '40px', borderRadius: '10px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Filter size={18} style={{ color: 'var(--text-light)' }} />
          <select 
            className="form-control" 
            style={{ width: '160px', borderRadius: '10px', fontWeight: 600 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>
      
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
                <th style={thStyle}>TICKET INFO</th>
                <th style={thStyle}>SUBMITTED BY</th>
                <th style={thStyle}>PRIORITY</th>
                <th style={thStyle}>STATUS</th>
                <th style={thStyle}>DATE</th>
                <th style={thStyle}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(ticket => (
                <tr 
                  key={ticket._id} 
                  style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.2s', cursor: 'pointer' }} 
                  onClick={() => setSelectedTicket(ticket)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 700, color: 'var(--text)' }}>{ticket.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 500 }}>{ticket.category} • #{ticket._id.slice(-6).toUpperCase()}</div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.625rem', fontWeight: 700 }}>
                        {ticket.user.name.charAt(0)}
                      </div>
                      {ticket.user.name}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <span className={`badge badge-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
                  </td>
                  <td style={tdStyle}>
                    <span className={`badge badge-${ticket.status.toLowerCase().replace(' ', '-')}`}>{ticket.status}</span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-light)' }}>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    {ticket.status !== 'Resolved' && (
                      <button 
                        onClick={(e) => handleResolveTicket(e, ticket._id)}
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--success)', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredTickets.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light)' }}>
                    No tickets match your current search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Modal */}
      {selectedTicket && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0, lineHeight: 1.3 }}>{selectedTicket.title}</h2>
              <button 
                onClick={(e) => { e.stopPropagation(); setSelectedTicket(null); setResolveFeedback(''); }} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', padding: '0.25rem' }}
              >
                <X size={24} />
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className={`badge badge-${selectedTicket.priority.toLowerCase()}`}>{selectedTicket.priority}</span>
              <span className={`badge badge-${selectedTicket.status.toLowerCase().replace(' ', '-')}`}>{selectedTicket.status}</span>
              <span className="badge" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>{selectedTicket.category}</span>
            </div>

            {selectedTicket.status !== 'Resolved' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Resolution Feedback (Optional)</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    placeholder="Add a note before resolving..."
                    value={resolveFeedback}
                    onChange={(e) => setResolveFeedback(e.target.value)}
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>
                <button 
                  className="btn btn-primary" 
                  onClick={handleResolveFromModal}
                  disabled={resolveLoading}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {resolveLoading ? 'Resolving...' : 'Resolve Ticket'}
                </button>
              </div>
            )}
            
            {selectedTicket.status === 'Resolved' && (
              <div style={{ textAlign: 'center', color: 'var(--success)', fontWeight: 600, padding: '1.5rem 0' }}>
                <CheckCircle size={32} style={{ margin: '0 auto 0.5rem' }} />
                This ticket has been resolved.
                {ticketReplies.length > 0 && (
                  <div style={{ marginTop: '1.25rem', padding: '1rem', backgroundColor: 'var(--background)', borderRadius: '8px', color: 'var(--text-primary)', textAlign: 'left', fontSize: '0.875rem', fontWeight: 500, border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Resolution Note</div>
                    {ticketReplies[ticketReplies.length - 1].message}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, onClick }) => (
  <div 
    className="card" 
    onClick={onClick}
    style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '1.25rem', 
      padding: '1.5rem',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s, box-shadow 0.2s',
      ...onClick && { ':hover': { transform: 'translateY(-2px)' } }
    }}
  >
    <div style={{ 
      backgroundColor: 'var(--background)', 
      padding: '0.875rem', 
      borderRadius: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.02)'
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{title}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1 }}>{value}</div>
    </div>
  </div>
);

const thStyle = { 
  padding: '1rem 1.5rem', 
  fontSize: '0.75rem', 
  fontWeight: 700, 
  color: 'var(--text-light)',
  letterSpacing: '0.05em'
};

const tdStyle = { 
  padding: '1.25rem 1.5rem', 
  fontSize: '0.875rem',
  cursor: 'pointer'
};

export default AdminDashboard;
