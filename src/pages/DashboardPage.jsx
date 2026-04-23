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

  const dashboardsMetadata = {
    'muni-risk-hub': {
      title: 'Municipal Risk Tools | Dr. Craig D. Rye',
      description: 'Dual-layer intelligence engine mapping 189,000+ municipal bonds across 1,400+ U.S. counties, overlaid with FEMA National Risk Index physical hazard scores.'
    },
    'antarctic-climate-change': {
      title: 'Antarctic Climate Dynamics | Dr. Craig D. Rye',
      description: 'Interactive dashboard analyzing Antarctic shelf waters and their impact on global sea level rise. Quantitative research on physical climate risk.'
    },
    'complexity-economics': {
      title: 'Non-Linear Market Dynamics | Dr. Craig D. Rye',
      description: 'Exploring non-linear systems and market indicators through a complexity lens. Interactive simulations of tipping points and feedback loops.'
    },
    'climate-fear-index': {
      title: 'Climate Fear Index | Dr. Craig D. Rye',
      description: 'Empirical analysis suggests there could be a connection between hotter temperatures and social interest in climate change. This dashboard compares global climate news volume, social sentiment, and Google search interest with climate indicators.'
    },
    'global-temperature-tracker': {
      title: 'Global Temperature Tracker | Dr. Craig D. Rye',
      description: 'GISTEMP observations vs. CMIP6 model uncertainty with near-term expert predictions. Real-time visualization and analysis of global mean temperature anomalies.'
    },
    'data-mining': {
      title: 'Data Mining Hub | Dr. Craig D. Rye',
      description: 'Cross-platform attention analytics mapping 100+ research topics across Wikipedia, Google Search, and GDELT news volume to quantify public and scholarly interest.'
    }
  };

  const currentMetadata = dashboardsMetadata[dashboardId] || {
    title: 'Research Dashboard | Dr. Craig D. Rye',
    description: 'Specialized research dashboard exploring the intersection of climate science and quantitative finance.'
  };

  // Update document metadata for SEO
  useEffect(() => {
    document.title = currentMetadata.title;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', currentMetadata.description);
    }

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `https://craigrye.com/dashboards/${dashboardId}`);
    }

    // Cleanup when leaving the page (optional but good practice)
    return () => {
      document.title = 'Dr. Craig D. Rye — Climate Science & Quantitative Research';
      if (metaDescription) {
        metaDescription.setAttribute('content', 'Dr. Craig D. Rye: Institutional Investor #1 Ranked Quantitative Researcher & Climate Scientist.');
      }
    };
  }, [dashboardId, currentMetadata]);

  return (
    <main className="dashboard-page" style={{ paddingTop: 'var(--nav-height)' }}>
      <iframe 
        ref={iframeRef}
        onLoad={handleIframeLoad}
        src={`/projects/${dashboardId}/index.html`}
        title={currentMetadata.title}
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
