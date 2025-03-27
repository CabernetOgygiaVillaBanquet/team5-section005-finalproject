import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Admin.css';
import { FaCodeBranch, FaGithub, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const REPO_OWNER = 'CabernetOgygiaVillaBanquet';
const REPO_NAME = 'LabCyber-Machine-Protocol-Application';
const GITHUB_TOKEN = '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';

const AdminDashboard = () => {
  const [pullRequests, setPullRequests] = useState([]);
  const [closedRequests, setClosedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('open');

  useEffect(() => {
    const fetchPullRequests = async () => {
      try {
        const [openRes, closedRes] = await Promise.all([
          axios.get(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls?state=open`, {
            headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
          }),
          axios.get(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls?state=closed`, {
            headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
          })
        ]);
        setPullRequests(openRes.data);
        setClosedRequests(closedRes.data);
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
      setPullRequests((prev) => prev.filter((pr) => pr.number !== prNumber));
    } catch (err) {
      console.error(`Failed to ${action} PR #${prNumber}:`, err);
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

  const enrichPRsWithFiles = async (prs, setState) => {
    const detailed = await Promise.all(
      prs.map(async pr => {
        const files = await fetchFiles(pr.number);
        return { ...pr, files };
      })
    );
    setState(detailed);
  };

  useEffect(() => {
    if (!loading) {
      enrichPRsWithFiles(pullRequests, setPullRequests);
      enrichPRsWithFiles(closedRequests, setClosedRequests);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const PRCard = ({ pr }) => (
    <li className="pr-card modern">
      <div className="pr-header">
        <h3>{pr.title}</h3>
        <span className="pr-number">#{pr.number}</span>
      </div>
      <p className="pr-meta">
        <FaGithub /> @{pr.user.login} • <FaClock /> {new Date(pr.created_at).toLocaleString()}
      </p>
      <a href={pr.html_url} target="_blank" rel="noopener noreferrer" className="gh-link">
        <FaCodeBranch /> View on GitHub
      </a>
      {pr.files && (
        <div className="file-list">
          <strong>📁 Files:</strong>
          <ul>
            {pr.files.map((file, idx) => <li key={idx}>{file}</li>)}
          </ul>
        </div>
      )}
      {activeTab === 'open' && (
        <div className="pr-actions">
          <button onClick={() => handleAction(pr.number, 'merge')} className="approve">
            <FaCheckCircle /> Approve
          </button>
          <button onClick={() => handleAction(pr.number, 'reject')} className="reject">
            <FaTimesCircle /> Reject
          </button>
        </div>
      )}
    </li>
  );

  return (
    <div className="admin-dashboard">
      <h2>🛠️ LabCyber PR Review Panel</h2>
      <div className="tabs modern">
        <button className={activeTab === 'open' ? 'active' : ''} onClick={() => setActiveTab('open')}>
          🟢 Open PRs
        </button>
        <button className={activeTab === 'closed' ? 'active' : ''} onClick={() => setActiveTab('closed')}>
          📁 Closed PRs
        </button>
      </div>
      {loading ? (
        <p className="loading">⏳ Loading pull requests...</p>
      ) : (
        <ul className="pr-list">
          {(activeTab === 'open' ? pullRequests : closedRequests).map((pr) => (
            <PRCard key={pr.id} pr={pr} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminDashboard;
