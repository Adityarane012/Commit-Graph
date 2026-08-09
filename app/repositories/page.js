"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [repos, setRepos] = useState([]);
  const [stats, setStats] = useState({ totalRepos: 0, totalCommits: 0 });
  const [loading, setLoading] = useState(true);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
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

  useEffect(() => {
    fetch('/api/repos')
      .then(res => res.json())
      .then(data => {
        setRepos(data.repos || []);
        
        let commits = 0;
        data.repos?.forEach(r => commits += r.commitCount);
        setStats({
          totalRepos: data.repos?.length || 0,
          totalCommits: commits
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch repos", err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container/70 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.1)] border-b border-white/5">
        <div className="h-16 w-full px-margin-desktop flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-headline-md text-headline-md tracking-tight text-on-surface">CommitGraph</Link>
            <nav className="hidden md:flex items-center gap-8 ml-8">
              <Link aria-current="page" className="transition-colors text-primary font-medium" href="/repositories">Dashboard</Link>
              <Link className="font-label-caps text-label-caps text-on-surface-variant hover:text-on-surface transition-colors" href="/github">Repositories</Link>
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
        <div className="flex flex-col w-full gap-gutter">
          {/* Hero Section */}
          <section className="relative flex flex-col items-center justify-center py-24 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background animate-[pulse_4s_ease-in-out_infinite]"></div>
            <div className="relative z-10 flex flex-col items-center gap-6">
              <h1 className="font-display-hero text-display-hero text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">
                Visualize Your Codebase's Evolution
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                Deep analytics and dependency graphing for high-velocity engineering teams. Connect your repositories to instantly generate insightful commit graphs.
              </p>
              <button onClick={() => setIsGitHubModalOpen(true)} className="relative group mt-8 px-8 py-4 bg-primary text-on-primary rounded-full font-label-caps text-label-caps overflow-hidden shadow-[0_0_20px_rgba(192,193,255,0.3)] hover:shadow-[0_0_30px_rgba(192,193,255,0.5)] transition-all duration-300">
                <span className="relative z-10 flex items-center gap-2">
                  Connect GitHub
                  <span className="material-symbols-outlined text-[18px]">account_tree</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-tertiary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </section>

          {/* Global Stats Bar */}
          <section className="flex flex-wrap items-center justify-center gap-8 py-8 border-y border-white/5 bg-surface-container-lowest/50 backdrop-blur-md">
            <div className="flex flex-col items-center gap-1">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Total Repositories</span>
              <span className="font-code-sm text-headline-lg text-secondary">{stats.totalRepos}</span>
            </div>
            <div className="w-px h-12 bg-white/10 hidden sm:block"></div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Total Commits Tracked</span>
              <span className="font-code-sm text-headline-lg text-tertiary">{stats.totalCommits}</span>
            </div>
            <div className="w-px h-12 bg-white/10 hidden md:block"></div>
            <div className="flex flex-col items-center gap-1">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">LLM Model</span>
              <span className="font-code-sm text-headline-lg text-primary">LLaMA 3.3</span>
            </div>
          </section>

          {/* Repository Grid */}
          <section className="flex flex-col gap-8 py-12">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Available Repositories</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="text-on-surface-variant">Loading repositories...</div>
              ) : repos.map((repo, idx) => (
                <Link href={`/repo/${repo.key}`} key={repo.key} className="group relative bg-surface-container/70 backdrop-blur-[10px] rounded-xl p-6 border border-white/10 transition-all duration-300 hover:bg-surface-container-high/80 hover:-translate-y-1 block">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-tertiary opacity-0 group-hover:opacity-100 group-hover:shadow-[0_0_20px_rgba(192,193,255,0.4)] transition-all duration-300 rounded-t-xl"></div>
                  <div className="flex flex-col h-full justify-between gap-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                            <span className="material-symbols-outlined text-on-surface-variant">code</span>
                          </div>
                          <h3 className="font-headline-md text-headline-md text-on-surface">{repo.name}</h3>
                        </div>
                      </div>
                      <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2">
                        {repo.owner}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 font-code-sm text-code-sm text-on-surface-variant">
                      <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">call_split</span> {repo.commitCount} commits</div>
                      <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f1e05a]"></span> Last updated: {new Date(repo.lastUpdated).toLocaleDateString()}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="w-full bg-surface-container-lowest border-t border-outline-variant py-12 px-margin-desktop mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="font-label-caps text-label-caps uppercase">CommitGraph © 2026</span>
          </div>

        </div>
      </footer>

      {isGitHubModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface-container/90 backdrop-blur-xl border border-white/10 p-8 rounded-2xl max-w-md w-full shadow-2xl flex flex-col gap-6 animate-[fadeInUp_0.3s_ease-out]">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[32px]">hub</span>
                <h2 className="font-display-hero text-[1.5rem] text-on-surface">Connect GitHub</h2>
              </div>
              <button onClick={() => setIsGitHubModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="font-body-md text-on-surface-variant">
              GitHub OAuth integration is coming soon! For the Hack Devengers prototype, we are demonstrating CommitGraph using heavily pre-indexed repositories to ensure maximum AI speed and stability during the live demo.
            </p>
            <button 
              onClick={() => setIsGitHubModalOpen(false)}
              className="w-full py-3 bg-gradient-to-r from-primary to-secondary-container rounded-lg font-label-caps text-label-caps text-on-primary font-bold tracking-wider hover:opacity-90 transition-opacity"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
