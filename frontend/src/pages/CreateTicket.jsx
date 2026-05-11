import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const CreateTicket = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Technical',
    priority: 'Low'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/tickets', formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h1>Create New Ticket</h1>
      <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>Please provide details about the issue you're experiencing.</p>

      <div className="card">
        {error && <div style={{ 
          backgroundColor: '#fee2e2', 
          color: '#991b1b', 
          padding: '0.75rem', 
          borderRadius: '0.375rem', 
          marginBottom: '1rem'
        }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Issue Title</label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-control"
              placeholder="Briefly describe the issue"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Technical">Technical</option>
                <option value="Payment">Payment</option>
                <option value="Account">Account</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                className="form-control"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Detailed Description</label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              style={{ minHeight: '150px', resize: 'vertical' }}
              placeholder="Explain the issue in detail..."
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </button>
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={() => navigate('/dashboard')}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;
