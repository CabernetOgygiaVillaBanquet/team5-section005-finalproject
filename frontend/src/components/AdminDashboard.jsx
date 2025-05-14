import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaGithub, FaCheckCircle, FaTimesCircle, FaSearch, FaFilter, FaChartBar, FaFileAlt, FaUsers, FaExclamationTriangle } from 'react-icons/fa';
import './Admin.css';

const REPO_OWNER = 'CabernetOgygiaVillaBanquet';
const REPO_NAME = 'LabCyber-Machine-Protocol-Application';
const GITHUB_TOKEN = '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';

const AdminDashboard = () => {
  const [pullRequests, setPullRequests] = useState([]);
  const [closedRequests, setClosedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('open');
  const [toastMessage, setToastMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState({
    totalApproved: 0,
    totalRejected: 0,
    byHierarchy: {},
    byType: {}
  });

  useEffect(() => {
    const fetchPullRequests = async () => {
      try {
        setLoading(true);
        const [openRes, closedRes] = await Promise.all([
          axios.get(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls?state=open`, {
            headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
          }),
          axios.get(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls?state=closed`, {
            headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
          })
        ]);
        
        const openPRs = openRes.data;
        const closedPRs = closedRes.data;
        
        setPullRequests(openPRs);
        setClosedRequests(closedPRs);
        
        // Calculate statistics
        const approved = closedPRs.filter(pr => pr.merged_at).length;
        const rejected = closedPRs.filter(pr => !pr.merged_at).length;
        
        // Extract hierarchy and type info from PR titles/bodies
        const hierarchyStats = {};
        const typeStats = {};
        
        [...openPRs, ...closedPRs].forEach(pr => {
          // Parse PR body to extract hierarchy and type
          const bodyLines = pr.body?.split('\n') || [];
          let hierarchy = '';
          let type = '';
          
          bodyLines.forEach(line => {
            if (line.includes('Hierarchy:')) {
              hierarchy = line.split('Hierarchy:')[1].trim().split(' ')[0];
              if (hierarchy) {
                hierarchyStats[hierarchy] = (hierarchyStats[hierarchy] || 0) + 1;
              }
            }
            if (line.includes('Type:')) {
              type = line.split('Type:')[1].trim();
              if (type) {
                typeStats[type] = (typeStats[type] || 0) + 1;
              }
            }
          });
        });
        
        setStats({
          totalApproved: approved,
          totalRejected: rejected,
          byHierarchy: hierarchyStats,
          byType: typeStats
        });
        
      } catch (err) {
        console.error('Error fetching PRs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPullRequests();
  }, []);

  const handleAction = async (prNumber, action) => {
    const confirmAction = window.confirm(`Are you sure you want to ${action} PR #${prNumber}?`);
    if (!confirmAction) return;

    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls/${prNumber}/${action === 'merge' ? 'merge' : ''}`;
    try {
      await axios({
        method: action === 'merge' ? 'put' : 'patch',
        url: url,
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json'
        },
        data: action === 'reject' ? { state: 'closed' } : {}
      });

      // Update PR lists
      setPullRequests((prev) => prev.filter((pr) => pr.number !== prNumber));
      
      // Update stats
      if (action === 'merge') {
        setStats(prev => ({
          ...prev,
          totalApproved: prev.totalApproved + 1
        }));
      } else {
        setStats(prev => ({
          ...prev,
          totalRejected: prev.totalRejected + 1
        }));
      }
      
      // Show success message
      setToastMessage(`PR #${prNumber} ${action === 'merge' ? 'approved ✅' : 'rejected ❌'}`);
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err) {
      console.error(`Failed to ${action} PR #${prNumber}:`, err);
      setToastMessage(`Error: Failed to ${action} PR #${prNumber}`);
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  const fetchFiles = async (prNumber) => {
    try {
      const res = await axios.get(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls/${prNumber}/files`, {
        headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
      });
      return res.data.map(file => file.filename);
    } catch (err) {
      console.error('Error fetching files:', err);
      return [];
    }
  };

  // Filter PRs based on search term and filter type
  const filterPRs = (prs) => {
    if (!prs) return [];
    
    return prs.filter(pr => {
      const matchesSearch = searchTerm === '' || 
        pr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pr.body?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pr.user.login.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      
      if (filterType === 'all') return true;
      
      // Extract hierarchy type from PR body
      const bodyLines = pr.body?.split('\n') || [];
      let hierarchyType = '';
      
      bodyLines.forEach(line => {
        if (line.includes('Hierarchy:')) {
          const hierarchyInfo = line.split('Hierarchy:')[1].trim();
          if (hierarchyInfo.includes('(Project)')) hierarchyType = 'project';
          else if (hierarchyInfo.includes('(Machine)')) hierarchyType = 'machine';
          else if (hierarchyInfo.includes('Event')) hierarchyType = 'event';
          else hierarchyType = 'other';
        }
      });
      
      return filterType === hierarchyType;
    });
  };

  const PRCard = ({ pr }) => {
    const [files, setFiles] = useState([]);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
      fetchFiles(pr.number).then(setFiles);
    }, [pr.number]);

    // Extract PR creation date
    const createdDate = new Date(pr.created_at).toLocaleDateString();
    const createdTime = new Date(pr.created_at).toLocaleTimeString();

    return (
      <li className="pr-card">
        <div className="pr-header">
          <h3>{pr.title}</h3>
          <span className="pr-number">#{pr.number}</span>
        </div>
        
        <div className="pr-meta">
          <span className="pr-author">👤 By: @{pr.user.login}</span>
          <span className="pr-date">📅 {createdDate} at {createdTime}</span>
        </div>
        
        <a href={pr.html_url} target="_blank" rel="noopener noreferrer" className="github-link">
          <FaGithub /> View on GitHub
        </a>

        <div className="file-preview">
          <strong>📁 Files ({files.length}):</strong>
          <ul className={expanded ? 'expanded' : 'collapsed'}>
            {files.map((file, idx) => {
              return (
                <li key={idx}>
                  <span className="file-name">{file}</span>
                </li>
              );
            })}
          </ul>
          {files.length > 3 && (
            <button className="toggle-files" onClick={() => setExpanded(!expanded)}>
              {expanded ? 'Show Less' : 'Show All Files'}
            </button>
          )}
        </div>

        {pr.body && (
          <div className="pr-description">
            <strong>📝 Description:</strong>
            <p>{pr.body}</p>
          </div>
        )}

        {activeTab === 'open' && (
          <>
            <div className="progress-steps">📝 Pending → 👁️ Reviewed → <span className="progress-options">✅ / ❌</span></div>
            <div className="pr-actions">
              <button onClick={() => handleAction(pr.number, 'merge')} className="approve">
                <FaCheckCircle /> Approve
              </button>
              <button onClick={() => handleAction(pr.number, 'reject')} className="reject">
                <FaTimesCircle /> Reject
              </button>
            </div>
          </>
        )}
      </li>
    );
  };

  // Stats Dashboard Component
  const StatsDashboard = () => {
    return (
      <div className="stats-dashboard">
        <h3><FaChartBar /> Upload Statistics</h3>
        
        <div className="stats-grid">
          <div className="stat-card">
            <h4>Total Uploads</h4>
            <div className="stat-value">{stats.totalApproved + stats.totalRejected + pullRequests.length}</div>
            <div className="stat-breakdown">
              <div><FaCheckCircle color="#4CAF50" /> {stats.totalApproved} Approved</div>
              <div><FaTimesCircle color="#F44336" /> {stats.totalRejected} Rejected</div>
              <div><FaExclamationTriangle color="#FFC107" /> {pullRequests.length} Pending</div>
            </div>
          </div>
          
          <div className="stat-card">
            <h4>By Hierarchy</h4>
            <ul className="stat-list">
              {Object.entries(stats.byHierarchy).map(([hierarchy, count]) => (
                <li key={hierarchy}>
                  <span>{hierarchy}</span>
                  <span className="stat-count">{count}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="stat-card">
            <h4>By Type</h4>
            <ul className="stat-list">
              {Object.entries(stats.byType).map(([type, count]) => (
                <li key={type}>
                  <span>{type}</span>
                  <span className="stat-count">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      
      <div className="dashboard-actions">
        <button 
          className={`action-button ${showStats ? 'active' : ''}`} 
          onClick={() => setShowStats(!showStats)}
        >
          <FaChartBar /> {showStats ? 'Hide Statistics' : 'Show Statistics'}
        </button>
      </div>
      
      {showStats && <StatsDashboard />}
      
      <div className="pr-section">
        <h3><FaFileAlt /> Pull Requests</h3>
        
        <div className="search-filter-bar">
          <div className="search-box">
            <FaSearch />
            <input 
              type="text" 
              placeholder="Search PRs..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-dropdown">
            <FaFilter />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="project">Projects</option>
              <option value="machine">Machines</option>
              <option value="event">Events</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        
        <div className="tabs">
          <button 
            className={activeTab === 'open' ? 'active' : ''} 
            onClick={() => setActiveTab('open')}
          >
            🟢 Open ({pullRequests.length})
          </button>
          <button 
            className={activeTab === 'closed' ? 'active' : ''} 
            onClick={() => setActiveTab('closed')}
          >
            📁 Closed ({closedRequests.length})
          </button>
        </div>

        {toastMessage && <div className="toast">{toastMessage}</div>}

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading pull requests...</p>
          </div>
        ) : (
          <>
            {filterPRs(activeTab === 'open' ? pullRequests : closedRequests).length === 0 ? (
              <div className="no-results">
                <FaExclamationTriangle />
                <p>No pull requests found matching your criteria</p>
              </div>
            ) : (
              <ul className="pr-list">
                {filterPRs(activeTab === 'open' ? pullRequests : closedRequests).map((pr) => (
                  <PRCard key={pr.id} pr={pr} />
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
