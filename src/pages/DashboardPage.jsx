import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../ThemeContext';

export default function DashboardPage() {
  const { dashboardId } = useParams();
  const { theme } = useTheme();
  const iframeRef = useRef(null);

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [dashboardId]);

  // Synchronize theme with the embedded iframe dashboard
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'THEME_CHANGE', payload: theme }, '*');
    }
  }, [theme]);

  // Send initial theme when the iframe loads
  const handleIframeLoad = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'THEME_CHANGE', payload: theme }, '*');
    }
  };

  const dashboardNames = {
    'antarctic-climate-change': 'Antarctic Climate Change',
    'complexity-economics': 'Complexity Economics',
    'climate-fear-index': 'Climate Fear Index',
    'global-temperature-tracker': 'Global Temperature Tracker',
    'data-mining': 'Data Mining'
  };

  const title = dashboardNames[dashboardId] || 'Research Dashboard';

  return (
    <main className="dashboard-page" style={{ paddingTop: 'var(--nav-height)' }}>
      <iframe 
        ref={iframeRef}
        onLoad={handleIframeLoad}
        src={`/projects/${dashboardId}/index.html`}
        title={title}
        style={{
          width: '100%',
          height: 'calc(100vh - var(--nav-height))',
          border: 'none',
          display: 'block',
          backgroundColor: 'var(--color-bg-primary)'
        }}
      />
    </main>
  );
}
