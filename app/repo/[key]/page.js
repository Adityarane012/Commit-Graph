'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function RepoPage() {
  const params = useParams();
  const key = params.key;

  const [repoData, setRepoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classifying, setClassifying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('diagram');
  const mermaidRef = useRef(null);
  const [mermaidReady, setMermaidReady] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' })
      });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Failed to sign out', err);
    }
  };

  // Fetch repo data
  useEffect(() => {
    fetch(`/api/repos/${key}/commits`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setRepoData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [key]);

  // Load mermaid dynamically
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs')
        .then(mod => {
          mod.default.initialize({
            startOnLoad: false,
            theme: 'dark',
            themeVariables: {
              primaryColor: '#6366f1',
              primaryTextColor: '#f1f5f9',
              primaryBorderColor: '#4f46e5',
              lineColor: '#64748b',
              secondaryColor: '#1a1a25',
              tertiaryColor: '#111119',
              background: '#0a0a0f',
              mainBkg: '#1a1a25',
              nodeBorder: '#4f46e5',
              clusterBkg: '#111119',
              titleColor: '#f1f5f9',
              edgeLabelBackground: '#111119',
            },
            flowchart: {
              htmlLabels: true,
              curve: 'basis',
            },
          });
          setMermaidReady(true);
        })
        .catch(() => {
          console.warn('ESM mermaid load failed, using fallback');
        });
    }
  }, []);

  // Render mermaid diagram when results change
  const renderMermaid = useCallback(async () => {
    if (!results?.mermaidDiagram || !mermaidRef.current || !mermaidReady) return;

    try {
      const mermaid = (await import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs')).default;
      const { svg } = await mermaid.render('mermaid-diagram', results.mermaidDiagram);
      mermaidRef.current.innerHTML = svg;
    } catch (err) {
      console.error('Mermaid render error:', err);
      if (mermaidRef.current) {
        mermaidRef.current.innerHTML = `<pre style="color: var(--text-secondary); font-size: 0.85rem; white-space: pre-wrap;">${results.mermaidDiagram}</pre>`;
      }
    }
  }, [results, mermaidReady]);

  useEffect(() => {
    if (activeTab === 'diagram') {
      renderMermaid();
    }
  }, [activeTab, renderMermaid]);

  // Classify commits
  const handleClassify = async (force = false) => {
    setClassifying(true);
    setProgress(0);
    setError(null);
    setResults(null);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        return prev + Math.floor(Math.random() * 5) + 1;
      });
    }, 500);

    try {
      const res = await fetch(`/api/repos/${key}/classify?force=${force}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      setProgress(100);
      const data = await res.json();
      setResults(data);
      setActiveTab('diagram');
    } catch (err) {
      setError(err.message);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => setClassifying(false), 500);
    }
  };

  // Copy mermaid source
  const copyMermaid = () => {
    if (results?.mermaidDiagram) {
      navigator.clipboard.writeText(results.mermaidDiagram);
    }
  };

  // Get dominant confidence for a feature
  const getDominantConfidence = (feature) => {
    const { confidences } = feature;
    if (!confidences) return 'medium';
    if (confidences.high >= confidences.medium && confidences.high >= confidences.low) return 'high';
    if (confidences.medium >= confidences.low) return 'medium';
    return 'low';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="text-primary font-headline-md animate-pulse">Loading repository data...</div>
      </div>
    );
  }

  // Parse repo owner and name if it's in the format owner/name, otherwise use the key
  const repoNameParts = repoData?.repo?.name?.split('/') || [key];
  const repoOwner = repoNameParts.length > 1 ? repoNameParts[0] : '';
  const repoName = repoNameParts.length > 1 ? repoNameParts[1] : repoNameParts[0];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container/70 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.1)] border-b border-white/5">
        <div className="h-16 w-full px-margin-desktop flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-headline-md text-headline-md tracking-tight text-on-surface hover:text-primary transition-colors">CommitGraph</Link>
            <nav className="hidden md:flex items-center gap-8 ml-8">
              <Link href="/repositories" className="font-label-caps text-label-caps text-on-surface-variant hover:text-on-surface transition-colors">Dashboard</Link>
              <Link href="/github" className="transition-colors text-on-surface-variant hover:text-on-surface font-label-caps text-label-caps">Repositories</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant">
              <span className="w-2 h-2 rounded-full bg-[#238636] shadow-[0_0_8px_#238636]"></span>
              <span className="font-code-sm text-code-sm text-on-surface-variant">Authenticated</span>
            </div>
            <button 
              onClick={handleSignOut}
              title="Sign Out"
              className="w-8 h-8 rounded-full bg-surface-container-highest hover:bg-error/20 border border-transparent hover:border-error/50 flex items-center justify-center transition-colors text-on-surface-variant hover:text-error"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="w-full pt-16 px-margin-desktop min-h-screen bg-surface">
        <div className="flex flex-col w-full font-body-md text-on-surface">
          <div className="relative w-full overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none opacity-20 z-0 overflow-hidden">
              <svg className="absolute w-[800px] h-[800px] -top-[200px] -left-[200px] blur-[120px]" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <circle className="text-primary/30" cx="100" cy="100" fill="currentColor" r="100"></circle>
              </svg>
              <svg className="absolute w-[600px] h-[600px] top-[10%] right-[5%] blur-[100px]" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <circle className="text-secondary-container/20" cx="100" cy="100" fill="currentColor" r="100"></circle>
              </svg>
            </div>

            {/* Context Header */}
            <div className="relative z-10 w-full pt-12 pb-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4 mb-4 text-on-surface-variant">
                  <Link href="/repositories" className="hover:text-primary transition-colors flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    <span className="text-sm font-medium">Back to Repositories</span>
                  </Link>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-outline-variant text-[24px]">folder_open</span>
                  <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight leading-none mix-blend-screen">
                    {repoOwner && <>{repoOwner} <span className="text-on-surface-variant">/</span> </>}{repoName}
                  </h1>
                </div>
                
                <div className="flex items-center gap-4 mt-2">
                  {repoData?.repo?.url && (
                    <a className="flex items-center gap-1 font-code-sm text-code-sm text-on-surface-variant hover:text-primary transition-colors duration-300" href={repoData.repo.url} target="_blank" rel="noreferrer">
                      <span className="material-symbols-outlined text-[16px]">link</span>
                      {repoData.repo.url.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                  {repoData?.repo?.url && <span className="w-1 h-1 rounded-full bg-outline-variant"></span>}
                  <div className="flex items-center gap-2">
                    <span className="font-code-sm text-code-sm text-primary">{repoData?.commits?.length || 0}</span>
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Commits Available</span>
                  </div>
                  {results && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                      <div className="flex items-center gap-2">
                        <span className="font-code-sm text-code-sm text-secondary">{results.featureGroups?.length || 0}</span>
                        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Features Found</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Primary Action */}
              <button 
                disabled={classifying}
                onClick={() => handleClassify(!!results)}
                className={`group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg overflow-hidden transition-all duration-500 hover:scale-[1.02] ${classifying ? 'bg-surface-container-high opacity-70 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-secondary-container'}`}
              >
                {!classifying && (
                  <>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                    <div className="absolute inset-0 shadow-[0_0_20px_rgba(192,193,255,0.4)] group-hover:shadow-[0_0_30px_rgba(192,193,255,0.6)] transition-shadow duration-500 rounded-lg"></div>
                  </>
                )}
                <span className={`material-symbols-outlined ${classifying ? 'text-on-surface-variant animate-spin' : 'text-on-primary animate-pulse'} text-[20px] relative z-10`}>
                  {classifying ? 'refresh' : 'auto_awesome'}
                </span>
                <span className={`font-label-caps text-label-caps ${classifying ? 'text-on-surface-variant' : 'text-on-primary'} relative z-10 font-bold uppercase tracking-wider`}>
                  {classifying ? 'Classifying...' : (results ? 'Re-classify Commits' : 'Classify Commits with AI')}
                </span>
              </button>
            </div>
            
            {error && (
              <div className="relative z-10 w-full mb-6 p-4 rounded-lg bg-error-container/20 border border-error/50 text-error flex justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined">warning</span>
                  <span>{error}</span>
                </div>
                <button 
                  onClick={() => handleClassify(true)}
                  className="px-4 py-2 bg-error/20 hover:bg-error/30 text-error rounded-md text-sm font-bold transition-colors border border-error/50"
                >
                  Retry
                </button>
              </div>
            )}
            
            {classifying && (
              <div className="relative z-10 w-full mb-6 p-5 rounded-xl bg-surface-container border border-outline-variant/30 flex flex-col gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] animate-spin">autorenew</span>
                    AI Inference in Progress
                  </span>
                  <span className="font-code-sm text-primary text-[12px]">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-surface-container-highest overflow-hidden rounded-full">
                  <div className="h-full bg-gradient-to-r from-primary to-tertiary transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="font-code-sm text-code-sm text-on-surface-variant text-center mt-2 animate-pulse">
                  {progress < 30 ? "Initializing LLaMA 3.3 pipeline..." : 
                   progress < 60 ? `Analyzing diffs for ${repoData?.commits?.length || 0} commits...` : 
                   progress < 90 ? "Clustering architectural features..." : 
                   "Generating Mermaid graph..."}
                </p>
              </div>
            )}

            {/* Main Content Area */}
            {(!results && !classifying) && (
              <div className="relative z-10 w-full mt-8">
                <div className="bg-surface-container/30 rounded-xl p-6 border border-white/5">
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Recent Commits</h3>
                  <div className="flex flex-col gap-3">
                    {repoData?.commits?.slice(0, 20).map((commit, i) => (
                      <div key={i} className="flex items-start justify-between p-4 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors border border-transparent hover:border-outline-variant/30">
                        <div className="flex flex-col gap-1">
                          <span className="font-body-md text-body-md text-on-surface">{commit.message.split('\n')[0]}</span>
                          <div className="flex items-center gap-3 mt-1 font-code-sm text-code-sm text-on-surface-variant">
                            <span className="text-primary/80">{commit.sha.substring(0, 7)}</span>
                            <span>{new Date(commit.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {repoData?.commits?.length > 20 && (
                      <p className="text-center font-code-sm text-code-sm text-on-surface-variant mt-4">
                        ...and {repoData.commits.length - 20} more commits available for analysis
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {results && (
              <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-gutter mt-8">
                {/* Center Stage: Diagram/Visualization */}
                <div className="lg:col-span-9 flex flex-col gap-6">
                  {/* Results Tabs */}
                  <div className="flex items-center gap-2 p-1 bg-surface-container-low rounded-lg w-fit shadow-sm overflow-x-auto">
                    <button 
                      onClick={() => setActiveTab('diagram')}
                      className={`px-4 py-2 rounded-md font-label-caps text-label-caps transition-colors ${activeTab === 'diagram' ? 'bg-surface-container-high shadow-sm text-primary' : 'hover:bg-surface-container/50 text-on-surface-variant'}`}
                    >
                      Feature Diagram
                    </button>
                    <button 
                      onClick={() => setActiveTab('clusters')}
                      className={`px-4 py-2 rounded-md font-label-caps text-label-caps transition-colors ${activeTab === 'clusters' ? 'bg-surface-container-high shadow-sm text-primary' : 'hover:bg-surface-container/50 text-on-surface-variant'}`}
                    >
                      Feature Clusters
                    </button>
                    <button 
                      onClick={() => setActiveTab('timeline')}
                      className={`px-4 py-2 rounded-md font-label-caps text-label-caps transition-colors ${activeTab === 'timeline' ? 'bg-surface-container-high shadow-sm text-primary' : 'hover:bg-surface-container/50 text-on-surface-variant'}`}
                    >
                      Commit Timeline
                    </button>
                    <button 
                      onClick={() => setActiveTab('raw')}
                      className={`px-4 py-2 rounded-md font-label-caps text-label-caps transition-colors ${activeTab === 'raw' ? 'bg-surface-container-high shadow-sm text-primary' : 'hover:bg-surface-container/50 text-on-surface-variant'}`}
                    >
                      Raw Mermaid
                    </button>
                  </div>

                  {/* Glass Container for Diagram/Content */}
                  <div className="relative w-full min-h-[600px] bg-surface-container-lowest/40 backdrop-blur-md rounded-xl p-6 shadow-xl flex flex-col group transition-all duration-500 border border-white/5">
                    {/* Subtle glowing top border effect on hover */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    
                    {activeTab === 'diagram' && (
                      <>
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="font-headline-md text-headline-md text-on-surface">Architectural Flow</h2>
                          <div className="flex gap-3">
                            <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#0a2e16]/50 shadow-sm border border-[#166534]/30 backdrop-blur-sm">
                              <span className="font-code-sm text-code-sm text-[#4ade80]">
                                {results.classifiedCommits ? 
                                  Math.round((results.classifiedCommits.filter(c => c.classification.confidence === 'high').length / results.classifiedCommits.length) * 100) 
                                : 0}%
                              </span>
                              <span className="font-label-caps text-label-caps text-[#4ade80] opacity-80">High Confidence</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer" onClick={() => {}}>
                              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">zoom_in</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 rounded bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer" onClick={() => {}}>
                              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">fullscreen</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 w-full overflow-auto flex items-center justify-center">
                          <div ref={mermaidRef} className="w-full h-full min-h-[400px] flex items-center justify-center">
                            <p className="text-on-surface-variant">Rendering diagram...</p>
                          </div>
                        </div>
                      </>
                    )}

                    {activeTab === 'clusters' && (
                      <div className="flex flex-col h-full">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="font-headline-md text-headline-md text-on-surface">Feature Clusters</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2 max-h-[700px]">
                          {results.featureGroups?.map((feature, i) => {
                            const conf = getDominantConfidence(feature);
                            const confColor = conf === 'high' ? 'text-[#4ade80] bg-[#0a2e16]/50 border-[#166534]/30' : 
                                             conf === 'medium' ? 'text-[#facc15] bg-[#422006]/50 border-[#854d0e]/30' : 
                                             'text-[#f87171] bg-[#450a0a]/50 border-[#991b1b]/30';
                            
                            return (
                              <div key={i} className="flex flex-col bg-surface-container/50 rounded-xl border border-outline-variant/20 overflow-hidden">
                                <div className="p-4 bg-surface-container-high/50 border-b border-outline-variant/20 flex justify-between items-center">
                                  <div className="flex flex-col">
                                    <span className="font-headline-md text-body-lg text-on-surface">{feature.feature_name}</span>
                                    <span className="font-code-sm text-[12px] text-on-surface-variant mt-1">{feature.commitCount} commits</span>
                                  </div>
                                  <div className={`px-2 py-1 rounded border ${confColor} font-label-caps text-[10px] uppercase`}>
                                    {conf} Conf.
                                  </div>
                                </div>
                                <div className="p-4 flex flex-col gap-3 max-h-[300px] overflow-y-auto">
                                  {feature.commits.map((commit, j) => (
                                    <div key={j} className="flex flex-col gap-2 p-3 bg-surface-container-lowest/50 rounded border border-white/5">
                                      <span className="font-body-md text-[14px] text-on-surface">{commit.message.split('\n')[0]}</span>
                                      <div className="flex justify-between items-center">
                                        <span className="font-code-sm text-[11px] text-primary/70">{commit.sha.substring(0, 7)}</span>
                                        <span className="font-code-sm text-[11px] text-on-surface-variant">{new Date(commit.date).toLocaleDateString()}</span>
                                      </div>
                                      <div className="mt-1 pt-2 border-t border-white/5 flex gap-2 text-on-surface-variant text-[13px] font-body-md italic">
                                        <span className="text-secondary">💡</span> {commit.classification.reasoning}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {activeTab === 'timeline' && (
                      <div className="flex flex-col h-full">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="font-headline-md text-headline-md text-on-surface">Commit Timeline</h2>
                        </div>
                        <div className="flex flex-col gap-0 border-l-2 border-surface-container-highest ml-4 pl-6 relative max-h-[700px] overflow-y-auto">
                          {results.classifiedCommits?.map((commit, i) => {
                            const conf = commit.classification.confidence;
                            const confColor = conf === 'high' ? 'bg-[#4ade80]' : 
                                             conf === 'medium' ? 'bg-[#facc15]' : 
                                             'bg-[#f87171]';
                            
                            return (
                              <div key={i} className="relative pb-8 last:pb-0">
                                <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full ${confColor} shadow-[0_0_10px_currentColor] border-4 border-surface`}></div>
                                <div className="flex flex-col bg-surface-container/40 p-4 rounded-lg border border-outline-variant/10">
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="font-body-md font-medium text-on-surface">{commit.message.split('\n')[0]}</span>
                                    <span className="font-code-sm text-[12px] text-on-surface-variant whitespace-nowrap ml-4">{new Date(commit.date).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-3 mb-3">
                                    <span className="font-code-sm text-[12px] text-primary">{commit.sha.substring(0, 7)}</span>
                                    <span className="px-2 py-0.5 rounded bg-surface-container-highest text-secondary font-label-caps text-[10px] uppercase border border-secondary/20">
                                      {commit.classification.feature_name}
                                    </span>
                                    <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-label-caps text-[10px] uppercase border border-outline-variant/30">
                                      {conf} Conf
                                    </span>
                                  </div>
                                  <div className="text-[13px] text-on-surface-variant italic border-l-2 border-primary/30 pl-3">
                                    {commit.classification.reasoning}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {activeTab === 'raw' && (
                      <div className="flex flex-col h-full">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="font-headline-md text-headline-md text-on-surface">Mermaid Source</h2>
                          <button onClick={copyMermaid} className="flex items-center gap-2 px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 transition-colors">
                            <span className="material-symbols-outlined text-[16px]">content_copy</span>
                            <span className="font-label-caps text-[12px]">Copy Code</span>
                          </button>
                        </div>
                        <div className="flex-1 bg-[#0d0d12] rounded-lg p-4 overflow-auto border border-white/5 font-code-sm text-[13px] text-on-surface-variant">
                          <pre>{results.mermaidDiagram}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar: Feature Summary */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                  {/* AI Summary Card */}
                  <div className="relative bg-surface-container-lowest/60 backdrop-blur-md rounded-xl p-5 shadow-lg border border-outline-variant/30 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
                      <h3 className="font-headline-md text-body-lg font-medium text-on-surface">Analysis Summary</h3>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed text-[14px]">
                      AI classification successfully identified <strong>{results.featureGroups?.length || 0}</strong> distinct features across the parsed commits. 
                      Overall confidence is strong with {results.classifiedCommits ? Math.round((results.classifiedCommits.filter(c => c.classification.confidence === 'high').length / results.classifiedCommits.length) * 100) : 0}% 
                      high confidence matches.
                    </p>
                  </div>

                  {/* List Container */}
                  <div className="bg-surface-container/30 rounded-xl p-5 flex flex-col gap-4 border border-white/5">
                    <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-2 border-b border-outline-variant/20 pb-2">Identified Features</h3>
                    <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                      {results.featureGroups?.map((feature, i) => {
                        const colors = ['bg-primary', 'bg-tertiary', 'bg-secondary', 'bg-[#f59e0b]', 'bg-[#10b981]', 'bg-[#ec4899]'];
                        const dotColor = colors[i % colors.length];
                        const shadowColor = ['rgba(192,193,255,0.8)', 'rgba(76,215,246,0.8)', 'rgba(221,183,255,0.8)', 'rgba(245,158,11,0.8)', 'rgba(16,185,129,0.8)', 'rgba(236,72,153,0.8)'][i % colors.length];
                        
                        return (
                          <div key={i} className="group flex items-center justify-between p-3 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer border border-transparent hover:border-outline-variant/30">
                            <div className="flex flex-col">
                              <span className="font-code-sm text-code-sm text-on-surface group-hover:text-primary transition-colors max-w-[150px] truncate" title={feature.feature_name}>
                                {feature.feature_name}
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} style={{ boxShadow: `0 0 6px ${shadowColor}` }}></span>
                                <span className="font-label-caps text-[10px] text-on-surface-variant truncate max-w-[120px]">
                                  {getDominantConfidence(feature)} Conf
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="font-code-sm text-code-sm text-on-surface">{feature.commitCount}</span>
                              <span className="font-label-caps text-[10px] text-on-surface-variant">commits</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="w-full bg-surface-container-lowest border-t border-outline-variant py-12 px-margin-desktop mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="font-label-caps text-label-caps uppercase">CommitGraph © 2026</span>
          </div>

        </div>
      </footer>
    </>
  );
}
