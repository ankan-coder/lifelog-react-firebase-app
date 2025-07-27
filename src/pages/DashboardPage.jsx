import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/pages/DashboardPage.css';

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentEntries, setRecentEntries] = useState([]);
  const [stats, setStats] = useState({
    totalEntries: 0,
    thisWeek: 0,
    thisMonth: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        fetchUserData(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (userId) => {
    try {
      // Fetch recent journal entries
      const entriesQuery = query(
        collection(db, 'journal_entries'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      
      const entriesSnapshot = await getDocs(entriesQuery);
      const entries = entriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setRecentEntries(entries);

      // Calculate basic stats
      const allEntriesQuery = query(
        collection(db, 'journal_entries'),
        where('userId', '==', userId)
      );
      
      const allEntriesSnapshot = await getDocs(allEntriesQuery);
      const totalEntries = allEntriesSnapshot.size;
      
      // Calculate weekly and monthly entries
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      let thisWeek = 0;
      let thisMonth = 0;
      
      allEntriesSnapshot.docs.forEach(doc => {
        const entryDate = doc.data().createdAt?.toDate() || new Date();
        if (entryDate >= weekAgo) thisWeek++;
        if (entryDate >= monthAgo) thisMonth++;
      });
      
      setStats({
        totalEntries,
        thisWeek,
        thisMonth
      });
      
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown date';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>LifeLog Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {user?.displayName || user?.email}</span>
            <button onClick={handleSignOut} className="sign-out-btn">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="dashboard-nav">
        <Link to="/journal" className="nav-card">
          <div className="nav-icon">📝</div>
          <h3>Journal</h3>
          <p>Write and reflect on your day</p>
        </Link>
        
        <Link to="/tracker" className="nav-card">
          <div className="nav-icon">📊</div>
          <h3>Tracker</h3>
          <p>Monitor your habits and goals</p>
        </Link>
        
        <Link to="/profile" className="nav-card">
          <div className="nav-icon">👤</div>
          <h3>Profile</h3>
          <p>Manage your account settings</p>
        </Link>
      </nav>

      {/* Stats Overview */}
      <section className="stats-section">
        <h2>Your Activity</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.totalEntries}</div>
            <div className="stat-label">Total Entries</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.thisWeek}</div>
            <div className="stat-label">This Week</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.thisMonth}</div>
            <div className="stat-label">This Month</div>
          </div>
        </div>
      </section>

      {/* Recent Entries */}
      <section className="recent-section">
        <div className="section-header">
          <h2>Recent Journal Entries</h2>
          <Link to="/journal" className="view-all-link">View All</Link>
        </div>
        
        {recentEntries.length > 0 ? (
          <div className="entries-grid">
            {recentEntries.map((entry) => (
              <div key={entry.id} className="entry-card">
                <div className="entry-header">
                  <h3>{entry.title || 'Untitled Entry'}</h3>
                  <span className="entry-date">{formatDate(entry.createdAt)}</span>
                </div>
                <p className="entry-preview">
                  {truncateText(entry.content || 'No content')}
                </p>
                {entry.mood && (
                  <div className="entry-mood">
                    <span>Mood: {entry.mood}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No entries yet</h3>
            <p>Start your journaling journey by writing your first entry</p>
            <Link to="/journal" className="cta-button">
              Write Your First Entry
            </Link>
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/journal" className="action-card">
            <div className="action-icon">✍️</div>
            <span>New Journal Entry</span>
          </Link>
          <Link to="/tracker" className="action-card">
            <div className="action-icon">✅</div>
            <span>Update Tracker</span>
          </Link>
          <Link to="/profile" className="action-card">
            <div className="action-icon">⚙️</div>
            <span>Settings</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
