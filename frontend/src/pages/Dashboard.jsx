import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, MessageSquare, Clock, CheckCircle, List, ChevronRight, AlertCircle, Search, Filter } from 'lucide-react';

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const { user } = useAuth();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get('/tickets');
        setTickets(res.data.data);
        setFilteredTickets(res.data.data);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        // Fallback for Demo Mode
        if (user?._id?.startsWith('mock-id-')) {
          const demoData = [
            { _id: '1', title: 'Login issue with mobile app', status: 'Open', priority: 'High', category: 'Technical', createdAt: new Date() },
            { _id: '2', title: 'Invoice question regarding billing cycle', status: 'Resolved', priority: 'Low', category: 'Payment', createdAt: new Date() },
            { _id: '3', title: 'Feature request: Dark mode', status: 'In Progress', priority: 'Medium', category: 'Other', createdAt: new Date() }
          ];
          setTickets(demoData);
          setFilteredTickets(demoData);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  useEffect(() => {
    let result = tickets;
    
    if (search) {
      result = result.filter(t => 
        t.title.toLowerCase().includes(search.toLowerCase()) || 
        t._id.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (statusFilter !== 'All') {
      result = result.filter(t => t.status === statusFilter);
    }
    
    setFilteredTickets(result);
  }, [search, statusFilter, tickets]);

  if (loading) return <div className="loading"><div className="loading-spinner"></div><span>Fetching your tickets...</span></div>;

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

      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Welcome, {user?.name.split(' ')[0]}!</h1>
          <p style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>Manage your active support requests</p>
        </div>
        <Link to="/create-ticket" className="btn btn-primary" style={{ borderRadius: '10px' }}>
          <Plus size={20} />
          New Ticket
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <StatCard title="Total" value={tickets.length} icon={<MessageSquare size={20} color="var(--primary)" />} />
        <StatCard title="Active" value={tickets.filter(t => t.status !== 'Resolved').length} icon={<Clock size={20} color="var(--warning)" />} />
        <StatCard title="Resolved" value={tickets.filter(t => t.status === 'Resolved').length} icon={<CheckCircle size={20} color="var(--success)" />} />
      </div>

      {/* Filters Area */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search by title or ID..." 
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

      {filteredTickets.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            backgroundColor: 'var(--background)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <MessageSquare size={40} style={{ color: 'var(--text-light)' }} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {search || statusFilter !== 'All' ? 'No matching tickets' : 'No tickets found'}
          </h3>
          <p style={{ color: 'var(--text-light)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
            {search || statusFilter !== 'All' ? 'Try adjusting your search or filters.' : 'If you\'re facing any issues, create a ticket and our team will help you out.'}
          </p>
          {(search || statusFilter !== 'All') ? (
            <button className="btn btn-outline" onClick={() => { setSearch(''); setStatusFilter('All'); }}>Clear All Filters</button>
          ) : (
            <Link to="/create-ticket" className="btn btn-primary">Create Your First Ticket</Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredTickets.map(ticket => (
            <Link key={ticket._id} to={`/ticket/${ticket._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '1.25rem 1.5rem',
                borderLeft: ticket.priority === 'High' ? '4px solid var(--danger)' : '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>{ticket.title}</h3>
                    <span className={`badge badge-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-light)', fontSize: '0.8125rem', fontWeight: 500 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <List size={14} /> {ticket.category}
                    </span>
                    <span>•</span>
                    <span>ID: #{ticket._id.slice(-6).toUpperCase()}</span>
                    <span>•</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <span className={`badge badge-${ticket.status.toLowerCase().replace(' ', '-')}`}>
                    {ticket.status}
                  </span>
                  <ChevronRight size={20} color="var(--border)" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};


const StatCard = ({ title, value, icon }) => (
  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem' }}>
    <div style={{ 
      backgroundColor: 'var(--background)', 
      padding: '0.75rem', 
      borderRadius: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.025em' }}>{title}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{value}</div>
    </div>
  </div>
);

export default Dashboard;
