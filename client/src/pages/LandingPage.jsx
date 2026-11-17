/**
 * @fileoverview Complete Smart Expense Tracker Landing Page.
 * Conforms to designprompts.dev brief and wireframe harness:
 * Ground: #000000 | Accent: #6ee3ad | Buttons: #1c1c1c (pill)
 * Headlines: EB Garamond | Body: Host Grotesk
 * 
 * Order of Sections:
 * 1. Site header
 * 2. Hero
 * 3. Comparison
 * 4. Logo cloud
 * 5. Features
 * 6. Download
 * 7. Blog index
 * 8. Closing
 * 9. Footer
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/landing.css';

export default function LandingPage() {
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedQuickstart, setCopiedQuickstart] = useState(false);
  const { loginWithDemo, currentUser } = useAuth();
  const navigate = useNavigate();

  const gitCloneCmd = 'git clone https://github.com/ThakurSanskarSingh/smart_expense_tracker.git';
  const quickstartCmd = 'git clone https://github.com/ThakurSanskarSingh/smart_expense_tracker.git\ncd smart_expense_tracker\nnpm install\nnpm run seed\nnpm run dev:server  # port 5000\nnpm run dev:client  # port 5173';

  const copyToClipboard = (text, setFn) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  const handleDemoLaunch = async () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      try {
        await loginWithDemo();
        navigate('/dashboard');
      } catch {
        navigate('/login');
      }
    }
  };

  return (
    <div className="lp-wrapper">
      {/* 1. SITE HEADER */}
      <header className="lp-site-header">
        <div className="lp-container">
          <div className="lp-brand-row">
            <div className="lp-brand-search-stub">
              <span style={{ fontSize: '13px', opacity: 0.6 }}>🔍 Search docs...</span>
            </div>

            <Link to="/" className="lp-brand-logo-center">
              <div className="lp-logo-glyph">₹</div>
              <span className="lp-brand-title">Smart expense tracker</span>
            </Link>

            <div className="lp-brand-actions-right">
              <Link to="/login" className="lp-btn-link" style={{ fontSize: '14px', textDecoration: 'none' }}>
                Sign in
              </Link>
              <button onClick={handleDemoLaunch} className="lp-btn lp-btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                {currentUser ? 'Dashboard ➔' : 'Launch'}
              </button>
            </div>
          </div>

          <nav className="lp-nav-bar" aria-label="Main Navigation">
            <a href="#comparison" className="lp-nav-link">Comparison</a>
            <a href="#architecture" className="lp-nav-link">Architecture</a>
            <a href="#features" className="lp-nav-link">Features</a>
            <a href="#download" className="lp-nav-link">Installation</a>
            <a href="#journal" className="lp-nav-link">Technical Journal</a>
          </nav>
        </div>
      </header>

      <main>
        {/* 2. HERO SECTION */}
        <section className="lp-hero-section">
          <div className="lp-container">
            <h1 className="lp-hero-headline">
              Financial clarity<br />
              from the first byte
            </h1>

            <p className="lp-hero-subhead">
              A production-grade, full-stack personal expense &amp; budget management system
              with automated financial insights, proactive threshold notifications, and recurring expense automation.
            </p>

            <div className="lp-hero-cta-group">
              <button onClick={handleDemoLaunch} className="lp-btn lp-btn-primary" style={{ padding: '14px 28px', fontSize: '15px' }}>
                🚀 Explore Live Demo
              </button>
              <Link to="/login" className="lp-btn lp-btn-secondary" style={{ padding: '14px 28px', fontSize: '15px' }}>
                Sign In to Account
              </Link>
            </div>

            {/* Install Command Pill */}
            <div className="lp-install-pill" onClick={() => copyToClipboard(gitCloneCmd, setCopiedInstall)} title="Click to copy clone command">
              <span>$ {gitCloneCmd}</span>
              <button className="lp-install-copy-btn" type="button" aria-label="Copy clone command">
                {copiedInstall ? '✓ Copied' : '📋 Copy'}
              </button>
            </div>

            {/* Key Numbers Grid */}
            <div className="lp-hero-metrics">
              <div className="lp-metric-item">
                <span className="lp-metric-val">10+</span>
                <span className="lp-metric-label">Default Categories</span>
              </div>
              <div className="lp-metric-item">
                <span className="lp-metric-val">80% &amp; 100%</span>
                <span className="lp-metric-label">Proactive Caps</span>
              </div>
              <div className="lp-metric-item">
                <span className="lp-metric-val">00:05</span>
                <span className="lp-metric-label">Daily Daemon Cron</span>
              </div>
              <div className="lp-metric-item">
                <span className="lp-metric-val">&lt;50ms</span>
                <span className="lp-metric-label">Multi-Tenant Scoped</span>
              </div>
            </div>

            {/* Framed 3D Product Interface Showcase */}
            <div className="lp-product-stage">
              <div className="lp-product-frame">
                <div className="lp-product-chrome-bar">
                  <div className="lp-window-dots">
                    <span className="lp-window-dot" style={{ background: '#ff5f56' }} />
                    <span className="lp-window-dot" style={{ background: '#ffbd2e' }} />
                    <span className="lp-window-dot" style={{ background: '#27c93f' }} />
                  </div>
                  <div className="lp-window-address">smart-expense.kiet.edu/dashboard</div>
                  <div style={{ fontSize: '12px', color: 'var(--lp-accent)' }}>● Live Demo Mode</div>
                </div>

                <div className="lp-product-canvas">
                  <div className="lp-pf-kpis">
                    <div className="lp-pf-card">
                      <span className="lp-pf-card-title">Total Monthly Outflow</span>
                      <span className="lp-pf-card-amount">₹27,890</span>
                      <span className="lp-pf-card-status">↑ +208% MoM Surge</span>
                    </div>
                    <div className="lp-pf-card">
                      <span className="lp-pf-card-title">Allocated Budget Cap</span>
                      <span className="lp-pf-card-amount">₹35,000</span>
                      <span className="lp-pf-card-status" style={{ color: 'var(--lp-text-dim)' }}>80% Threshold Cap</span>
                    </div>
                    <div className="lp-pf-card">
                      <span className="lp-pf-card-title">Remaining Liquidity</span>
                      <span className="lp-pf-card-amount">₹7,110</span>
                      <span className="lp-pf-card-status">✓ Disciplined</span>
                    </div>
                    <div className="lp-pf-card">
                      <span className="lp-pf-card-title">Daily Average Run-Rate</span>
                      <span className="lp-pf-card-amount">₹1,641</span>
                      <span className="lp-pf-card-status" style={{ color: 'var(--lp-text-dim)' }}>Paced over 17 days</span>
                    </div>
                  </div>

                  {/* Visual Product Mock Preview */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', background: '#0a0a0a', padding: '20px', borderRadius: '12px', border: '1px solid #1a1a1a' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#f9f8f9' }}>12-Month Spending Trajectory</span>
                        <span style={{ fontSize: '12px', color: 'var(--lp-accent)' }}>Deterministic Engine</span>
                      </div>
                      <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '8px', borderBottom: '1px solid #222' }}>
                        {[45, 60, 52, 78, 65, 90, 72, 85, 95, 68, 82, 100].map((h, i) => (
                          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '100%', height: `${h}%`, background: i === 11 ? 'var(--lp-accent)' : '#1e1e1e', borderRadius: '4px 4px 0 0' }} />
                            <span style={{ fontSize: '10px', color: '#666' }}>{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#f9f8f9' }}>Category Share</span>
                        <span style={{ fontSize: '12px', color: '#888' }}>November</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span style={{ color: '#e5e5e4' }}>🍔 Food &amp; Dining</span>
                          <span style={{ color: 'var(--lp-accent)', fontWeight: 600 }}>38%</span>
                        </div>
                        <div style={{ height: '6px', background: '#1c1c1c', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: '38%', height: '100%', background: 'var(--lp-accent)' }} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '4px' }}>
                          <span style={{ color: '#e5e5e4' }}>🛍️ Shopping</span>
                          <span style={{ color: '#f9f8f9', fontWeight: 600 }}>29%</span>
                        </div>
                        <div style={{ height: '6px', background: '#1c1c1c', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: '29%', height: '100%', background: '#888' }} />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '4px' }}>
                          <span style={{ color: '#e5e5e4' }}>⚡ Rent &amp; Utilities</span>
                          <span style={{ color: '#f9f8f9', fontWeight: 600 }}>24%</span>
                        </div>
                        <div style={{ height: '6px', background: '#1c1c1c', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: '24%', height: '100%', background: '#555' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. COMPARISON SECTION */}
        <section id="comparison" className="lp-section">
          <div className="lp-container">
            <div className="lp-section-header">
              <h2 className="lp-section-title">Engineered against manual tracking</h2>
              <p className="lp-section-subhead">
                A quantitative comparison between Smart Expense Tracker's proactive architecture and traditional manual spreadsheets or legacy finance apps.
              </p>
            </div>

            <div className="lp-comparison-grid">
              {/* Product 1: Smart Expense Tracker */}
              <div className="lp-comparison-card highlighted">
                <span className="lp-comp-badge">RECOMMENDED FOR VIVA &amp; PRODUCTION</span>
                <h3 className="lp-comp-title">Smart Expense Tracker</h3>
                <p className="lp-comp-desc">Autonomous, full-stack personal finance system with dual-engine insights and proactive caps.</p>
                
                <div className="lp-comp-list">
                  <div className="lp-comp-item">
                    <span className="lp-comp-icon" style={{ color: 'var(--lp-accent)' }}>✓</span>
                    <span><strong>Proactive Alert System:</strong> Automated threshold evaluations at 80% warning and 100% hard limit.</span>
                  </div>
                  <div className="lp-comp-item">
                    <span className="lp-comp-icon" style={{ color: 'var(--lp-accent)' }}>✓</span>
                    <span><strong>Autonomous Recurring Daemon:</strong> Scheduled daily at 00:05 to record recurring charges without manual entry.</span>
                  </div>
                  <div className="lp-comp-item">
                    <span className="lp-comp-icon" style={{ color: 'var(--lp-accent)' }}>✓</span>
                    <span><strong>Dual-Engine Financial Insights:</strong> Deterministic anomaly detection paired with Gemini AI advice.</span>
                  </div>
                  <div className="lp-comp-item">
                    <span className="lp-comp-icon" style={{ color: 'var(--lp-accent)' }}>✓</span>
                    <span><strong>Multi-Tenant Scoped Isolation:</strong> Strict Firebase Admin JWT token verification on every MongoDB query.</span>
                  </div>
                  <div className="lp-comp-item">
                    <span className="lp-comp-icon" style={{ color: 'var(--lp-accent)' }}>✓</span>
                    <span><strong>Real-time Visual Analytics:</strong> Chart.js doughnut, 12-month bar, and budget vs actual comparisons.</span>
                  </div>
                  <div className="lp-comp-item">
                    <span className="lp-comp-icon" style={{ color: 'var(--lp-accent)' }}>✓</span>
                    <span><strong>Production-Ready Monorepo:</strong> Built with Node 20, Vite React 18, Jest, Vitest, and GitHub Actions CI.</span>
                  </div>
                </div>

                <div className="lp-comp-note">
                  * Benchmarked on sub-50ms execution across 126 seeded transactions and 6 historical budget cycles.
                </div>
              </div>

              {/* Product 2: Traditional Spreadsheets / Legacy Apps */}
              <div className="lp-comparison-card">
                <span className="lp-comp-badge" style={{ background: '#1c1c1c', color: '#888' }}>LEGACY ALTERNATIVE</span>
                <h3 className="lp-comp-title">Spreadsheets &amp; Legacy Apps</h3>
                <p className="lp-comp-desc">Manual spreadsheet logging, retrospective bookkeeping, and fragmented receipts.</p>
                
                <div className="lp-comp-list">
                  <div className="lp-comp-item">
                    <span className="lp-comp-icon" style={{ color: '#666' }}>—</span>
                    <span><strong>No Proactive Alerts:</strong> Only retrospective end-of-month realization of overspending.</span>
                  </div>
                  <div className="lp-comp-item">
                    <span className="lp-comp-icon" style={{ color: '#666' }}>—</span>
                    <span><strong>Manual Recurring Entry:</strong> Forgotten subscriptions require tedious manual row replication.</span>
                  </div>
                  <div className="lp-comp-item">
                    <span className="lp-comp-icon" style={{ color: '#666' }}>—</span>
                    <span><strong>Zero Anomaly Intelligence:</strong> No automated detection of month-over-month surges or dominance.</span>
                  </div>
                  <div className="lp-comp-item">
                    <span className="lp-comp-icon" style={{ color: '#666' }}>—</span>
                    <span><strong>Unprotected Cloud Sheets:</strong> Risk of accidental permission leaks and lack of tenant isolation.</span>
                  </div>
                  <div className="lp-comp-item">
                    <span className="lp-comp-icon" style={{ color: '#666' }}>—</span>
                    <span><strong>Static Visualizations:</strong> Fragile formulas and manual pivot tables prone to syntax breakage.</span>
                  </div>
                  <div className="lp-comp-item">
                    <span className="lp-comp-icon" style={{ color: 'var(--lp-accent)' }}>✓</span>
                    <span><strong>Basic CSV Export:</strong> Raw cell export without relational category hierarchy or tags.</span>
                  </div>
                </div>

                <div className="lp-comp-note">
                  * Requires an average of 45 minutes of manual bookkeeping and reconciliation each week.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. LOGO CLOUD */}
        <section id="architecture" className="lp-section" style={{ borderTop: '1px solid var(--lp-hairline)' }}>
          <div className="lp-container">
            <div className="lp-logo-cloud-wrap">
              <div>
                <h2 className="lp-section-title" style={{ fontSize: '36px' }}>
                  Industry-grade ecosystem
                </h2>
                <p className="lp-section-subhead" style={{ fontSize: '15px' }}>
                  Engineered with production-grade runtime primitives for security, performance, and real-time observability.
                </p>
              </div>

              <div className="lp-logo-grid">
                <div className="lp-logo-cell">
                  <div className="lp-logo-mark">⬢</div>
                  <div>
                    <div className="lp-logo-name">Node.js 20</div>
                    <div className="lp-logo-role">ESM Server Core</div>
                  </div>
                </div>
                <div className="lp-logo-cell">
                  <div className="lp-logo-mark">⚡</div>
                  <div>
                    <div className="lp-logo-name">Express 4</div>
                    <div className="lp-logo-role">Hardened REST API</div>
                  </div>
                </div>
                <div className="lp-logo-cell">
                  <div className="lp-logo-mark">🍃</div>
                  <div>
                    <div className="lp-logo-name">MongoDB Atlas</div>
                    <div className="lp-logo-role">Cloud Aggregation Engine</div>
                  </div>
                </div>
                <div className="lp-logo-cell">
                  <div className="lp-logo-mark">⚛️</div>
                  <div>
                    <div className="lp-logo-name">React 18 &amp; Vite</div>
                    <div className="lp-logo-role">Fast Single-Page App</div>
                  </div>
                </div>
                <div className="lp-logo-cell">
                  <div className="lp-logo-mark">🔥</div>
                  <div>
                    <div className="lp-logo-name">Firebase Admin</div>
                    <div className="lp-logo-role">JWT Token Verification</div>
                  </div>
                </div>
                <div className="lp-logo-cell">
                  <div className="lp-logo-mark">📊</div>
                  <div>
                    <div className="lp-logo-name">Chart.js</div>
                    <div className="lp-logo-role">Interactive Visualizations</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. FEATURES (Alternating Image & Text Rows) */}
        <section id="features" className="lp-section">
          <div className="lp-container">
            <div className="lp-section-header">
              <h2 className="lp-section-title">Architected for proactive discipline</h2>
              <p className="lp-section-subhead">
                Three core autonomous engines designed to prevent budget overruns before they occur.
              </p>
            </div>

            <div className="lp-features-container">
              {/* Feature Row 1: Image Left, Text Right */}
              <div className="lp-feature-row">
                <div className="lp-feature-visual">
                  <div style={{ background: '#050505', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#f9f8f9' }}>Budget Limit Evaluations</span>
                      <span style={{ fontSize: '12px', color: '#ffbd2e' }}>⚠️ 84% Threshold Warning</span>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                        <span style={{ color: '#ccc' }}>🍔 Food &amp; Dining Spending</span>
                        <span style={{ color: 'var(--lp-accent)', fontWeight: 600 }}>₹10,080 / ₹12,000</span>
                      </div>
                      <div style={{ height: '8px', background: '#1c1c1c', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: '84%', height: '100%', background: '#ffbd2e' }} />
                      </div>
                    </div>
                    <div style={{ background: '#0e0e0e', padding: '12px 16px', borderRadius: '8px', border: '1px solid #1d1d1d', fontSize: '12px', color: '#bbb' }}>
                      ⚡ Alert dispatched to notification center. Deduplicated per month.
                    </div>
                  </div>
                </div>
                <div>
                  <span className="lp-feature-tag">PROACTIVE MONITORING</span>
                  <h3 className="lp-feature-title">Real-Time Spending Caps &amp; Alerts</h3>
                  <p className="lp-feature-desc">
                    Rather than discovering overspending at the end of the month, Smart Expense Tracker triggers automated threshold evaluations at 80% warning and 100% hard limit. Notifications are automatically deduplicated to keep alerts actionable.
                  </p>
                  <Link to="/login" className="lp-feature-link">
                    Explore Budget Thresholds ➔
                  </Link>
                </div>
              </div>

              {/* Feature Row 2: Text Left, Image Right */}
              <div className="lp-feature-row reverse">
                <div className="lp-feature-visual">
                  <div style={{ background: '#050505', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#f9f8f9' }}>Dual-Engine Anomaly Matrix</span>
                      <span style={{ fontSize: '12px', color: 'var(--lp-accent)' }}>Active &lt;50ms</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ background: '#0f0f0f', padding: '10px 14px', borderRadius: '8px', border: '1px solid #222', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Month-over-Month Surge</span>
                        <span style={{ color: 'var(--lp-accent)', fontWeight: 600 }}>+208.9% Triggered</span>
                      </div>
                      <div style={{ background: '#0f0f0f', padding: '10px 14px', borderRadius: '8px', border: '1px solid #222', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Category Dominance (&gt;40%)</span>
                        <span style={{ color: '#ffbd2e', fontWeight: 600 }}>Food: 38% (Normal)</span>
                      </div>
                      <div style={{ background: '#0f0f0f', padding: '10px 14px', borderRadius: '8px', border: '1px solid #222', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Zero-Spend Days Tracked</span>
                        <span style={{ color: 'var(--lp-accent)', fontWeight: 600 }}>4 Days Paced</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="lp-feature-tag">DUAL-ENGINE INSIGHTS</span>
                  <h3 className="lp-feature-title">Instant Anomaly Detection</h3>
                  <p className="lp-feature-desc">
                    Combines deterministic mathematical rules for zero-latency anomaly detection (MoM surge &gt;20%, category dominance &gt;40%) with fallback Google Gemini AI advice. Your application never stalls waiting for third-party LLM API responses.
                  </p>
                  <Link to="/login" className="lp-feature-link">
                    View Financial Insights ➔
                  </Link>
                </div>
              </div>

              {/* Feature Row 3: Image Left, Text Right */}
              <div className="lp-feature-row">
                <div className="lp-feature-visual">
                  <div style={{ background: '#050505', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#f9f8f9' }}>Cron Scheduler Daemon</span>
                      <span style={{ fontSize: '12px', color: 'var(--lp-accent)' }}>⏰ Daily at 00:05</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#0d0d0d', borderRadius: '6px', fontSize: '12px' }}>
                        <span>📺 Netflix 4K (Monthly)</span>
                        <span style={{ color: 'var(--lp-accent)' }}>Auto-Recorded ₹649</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#0d0d0d', borderRadius: '6px', fontSize: '12px' }}>
                        <span>🏠 Apartment Rent (Monthly)</span>
                        <span style={{ color: 'var(--lp-accent)' }}>Auto-Recorded ₹8,000</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#0d0d0d', borderRadius: '6px', fontSize: '12px' }}>
                        <span>🌐 Airtel Fiber (Monthly)</span>
                        <span style={{ color: 'var(--lp-accent)' }}>Auto-Recorded ₹1,199</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="lp-feature-tag">AUTONOMOUS DAEMON</span>
                  <h3 className="lp-feature-title">Recurring Expense Automation</h3>
                  <p className="lp-feature-desc">
                    An embedded Node.js cron worker executes daily at 00:05, identifying due subscriptions, generating expense ledgers, and automatically advancing the next due date without manual data entry.
                  </p>
                  <Link to="/login" className="lp-feature-link">
                    See Recurring Schedules ➔
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. DOWNLOAD / INSTALLATION SECTION */}
        <section id="download" className="lp-section" style={{ borderTop: '1px solid var(--lp-hairline)' }}>
          <div className="lp-container">
            <div className="lp-section-header">
              <h2 className="lp-section-title">Install and run in minutes</h2>
              <p className="lp-section-subhead">
                Deploy locally for development, run via Docker, or deploy with pre-configured Vercel and Render targets.
              </p>
            </div>

            <div className="lp-download-split">
              {/* Left Column: Terminal Command Box */}
              <div className="lp-terminal-box">
                <div className="lp-terminal-header">
                  <div className="lp-window-dots">
                    <span className="lp-window-dot" style={{ background: '#ff5f56' }} />
                    <span className="lp-window-dot" style={{ background: '#ffbd2e' }} />
                    <span className="lp-window-dot" style={{ background: '#27c93f' }} />
                  </div>
                  <span style={{ fontSize: '12px', color: '#666', fontFamily: 'var(--lp-font-mono)', marginLeft: '8px' }}>bash — 1-minute quickstart</span>
                  <button
                    onClick={() => copyToClipboard(quickstartCmd, setCopiedQuickstart)}
                    className="lp-install-copy-btn"
                    style={{ marginLeft: 'auto' }}
                  >
                    {copiedQuickstart ? '✓ Copied' : '📋 Copy All'}
                  </button>
                </div>
                <pre className="lp-terminal-code">{quickstartCmd}</pre>
              </div>

              {/* Right Column: 3 Platforms */}
              <div className="lp-platform-stack">
                <div className="lp-platform-card">
                  <div className="lp-platform-info">
                    <span className="lp-platform-icon">🌐</span>
                    <div>
                      <div className="lp-platform-name">Production Web SPA</div>
                      <div className="lp-platform-meta">Vite React 18 · Vercel Ready</div>
                    </div>
                  </div>
                  <button onClick={handleDemoLaunch} className="lp-btn lp-btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                    Launch App
                  </button>
                </div>

                <div className="lp-platform-card">
                  <div className="lp-platform-info">
                    <span className="lp-platform-icon">🐳</span>
                    <div>
                      <div className="lp-platform-name">Cloud Container</div>
                      <div className="lp-platform-meta">Multi-Stage Docker · Render.yaml</div>
                    </div>
                  </div>
                  <a
                    href="https://github.com/ThakurSanskarSingh/smart_expense_tracker/blob/main/server/Dockerfile"
                    target="_blank"
                    rel="noreferrer"
                    className="lp-btn lp-btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    Dockerfile
                  </a>
                </div>

                <div className="lp-platform-card">
                  <div className="lp-platform-info">
                    <span className="lp-platform-icon">⚡</span>
                    <div>
                      <div className="lp-platform-name">Backend REST API</div>
                      <div className="lp-platform-meta">Node 20 · Express 4 · Jest 24 Tests</div>
                    </div>
                  </div>
                  <a
                    href="https://github.com/ThakurSanskarSingh/smart_expense_tracker/blob/main/docs/API.md"
                    target="_blank"
                    rel="noreferrer"
                    className="lp-btn lp-btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    API Spec
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. BLOG INDEX */}
        <section id="journal" className="lp-section">
          <div className="lp-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
              <div>
                <h2 className="lp-section-title" style={{ margin: 0 }}>Technical journal &amp; notes</h2>
                <p className="lp-section-subhead" style={{ marginTop: '8px' }}>
                  Architecture decisions, design patterns, and lessons learned building the Smart Expense Tracker.
                </p>
              </div>
              <a
                href="https://github.com/ThakurSanskarSingh/smart_expense_tracker"
                target="_blank"
                rel="noreferrer"
                className="lp-feature-link"
              >
                GitHub Repository ➔
              </a>
            </div>

            <div className="lp-blog-grid">
              {/* Featured Large Post */}
              <div className="lp-blog-featured">
                <div>
                  <div className="lp-blog-date">Nov 17, 2026 · 6 min read · Architecture</div>
                  <h3 className="lp-blog-title">
                    Architecting a Dual-Engine Financial Anomaly Detector in Node 20
                  </h3>
                  <p className="lp-blog-excerpt">
                    How we decoupled deterministic rules evaluation from external LLM API latency, achieving sub-50ms query turnaround while flagging rapid month-over-month surges, category dominance over 40%, and zero-spend tracking.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '16px', borderTop: '1px solid #1a1a1a' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                    IT
                  </div>
                  <span style={{ fontSize: '13px', color: '#ccc' }}>Group No. 41 · Department of IT</span>
                </div>
              </div>

              {/* Stacked Post Cards */}
              <div className="lp-blog-list">
                <div className="lp-blog-card">
                  <div className="lp-blog-date">Nov 12, 2026 · 4 min read · Security</div>
                  <h4 className="lp-blog-card-title">
                    Zero-Leakage Multi-Tenancy with Firebase Admin JWT
                  </h4>
                  <p className="lp-blog-excerpt">
                    Enforcing strict req.user.id query scoping across all MongoDB Mongoose aggregation pipelines and rate limiters.
                  </p>
                </div>

                <div className="lp-blog-card">
                  <div className="lp-blog-date">Nov 05, 2026 · 3 min read · Cognitive UX</div>
                  <h4 className="lp-blog-card-title">
                    Why Proactive 80% Thresholds Beat Retrospective Logging
                  </h4>
                  <p className="lp-blog-excerpt">
                    The cognitive behavioral difference between real-time mid-month warnings and end-of-month budget exhaustion surprises.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. CLOSING CTA PANEL */}
        <section className="lp-section">
          <div className="lp-container">
            <div className="lp-closing-panel">
              <h2 className="lp-closing-headline">
                Take command of your financial trajectory today
              </h2>
              <p className="lp-closing-intro">
                Built and defended by Group No. 41 for the Department of Information Technology,
                KIET Group of Institutions, AKTU Lucknow.
              </p>
              <div className="lp-closing-actions">
                <button onClick={handleDemoLaunch} className="lp-btn lp-btn-primary" style={{ padding: '16px 32px', fontSize: '16px' }}>
                  🚀 Launch Live Demo
                </button>
                <Link to="/signup" className="lp-btn lp-btn-secondary" style={{ padding: '16px 32px', fontSize: '16px' }}>
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 9. FOOTER */}
      <footer className="lp-footer">
        <div className="lp-container">
          <div className="lp-footer-grid">
            <div className="lp-footer-brand">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="lp-logo-glyph">₹</div>
                <span className="lp-brand-title" style={{ fontSize: '20px' }}>Smart expense tracker</span>
              </div>
              <p className="lp-footer-tagline">
                Personal Expense &amp; Budget Management System. Department of Information Technology,
                KIET Group of Institutions, Ghaziabad (AKTU Lucknow).
              </p>
              <div style={{ fontSize: '12px', color: 'var(--lp-accent)' }}>
                ● Final Year Capstone Project · Group No. 41
              </div>
            </div>

            <div>
              <div className="lp-footer-col-title">System</div>
              <ul className="lp-footer-links">
                <li><Link to="/login" className="lp-footer-link">Dashboard</Link></li>
                <li><Link to="/login" className="lp-footer-link">Expenses Ledger</Link></li>
                <li><Link to="/login" className="lp-footer-link">Budget Limits</Link></li>
                <li><Link to="/login" className="lp-footer-link">Visual Analytics</Link></li>
                <li><Link to="/login" className="lp-footer-link">Smart Insights</Link></li>
              </ul>
            </div>

            <div>
              <div className="lp-footer-col-title">Architecture</div>
              <ul className="lp-footer-links">
                <li><a href="https://github.com/ThakurSanskarSingh/smart_expense_tracker" target="_blank" rel="noreferrer" className="lp-footer-link">REST API Contract</a></li>
                <li><a href="https://github.com/ThakurSanskarSingh/smart_expense_tracker" target="_blank" rel="noreferrer" className="lp-footer-link">MongoDB Atlas Schema</a></li>
                <li><a href="https://github.com/ThakurSanskarSingh/smart_expense_tracker" target="_blank" rel="noreferrer" className="lp-footer-link">Firebase Admin Auth</a></li>
                <li><a href="https://github.com/ThakurSanskarSingh/smart_expense_tracker" target="_blank" rel="noreferrer" className="lp-footer-link">Cron Daemon Engine</a></li>
              </ul>
            </div>

            <div>
              <div className="lp-footer-col-title">Academic</div>
              <ul className="lp-footer-links">
                <li><span className="lp-footer-link" style={{ color: '#ccc' }}>KIET Group of Institutions</span></li>
                <li><span className="lp-footer-link" style={{ color: '#888' }}>Dept. of Information Technology</span></li>
                <li><span className="lp-footer-link" style={{ color: '#888' }}>Dr. A.P.J. Abdul Kalam Tech Univ</span></li>
                <li><span className="lp-footer-link" style={{ color: '#888' }}>Project Batch 2026</span></li>
              </ul>
            </div>
          </div>

          <div className="lp-footer-bottom">
            <div>
              © 2026 Smart Expense Tracker (Group 41). Open source under MIT License.
            </div>
            <div className="lp-footer-socials">
              <a href="https://github.com/ThakurSanskarSingh/smart_expense_tracker" target="_blank" rel="noreferrer" className="lp-footer-social-link">GitHub</a>
              <Link to="/login" className="lp-footer-social-link">Live App</Link>
              <Link to="/login" className="lp-footer-social-link">Sign In</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
