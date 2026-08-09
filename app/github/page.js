"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function GitHubRepositories() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/repos')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRepos(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch local repos", err);
        setLoading(false);
      });
  }, []);

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

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container/70 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.1)] border-b border-white/5">
        <div className="h-16 w-full px-margin-desktop flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-headline-md text-headline-md tracking-tight text-on-surface hover:text-primary transition-colors">CommitGraph</Link>
            <nav className="hidden md:flex items-center gap-8 ml-8">
              <Link className="font-label-caps text-label-caps text-on-surface-variant hover:text-on-surface transition-colors" href="/repositories">Dashboard</Link>
              <Link aria-current="page" className="transition-colors text-primary font-medium" href="/github">Repositories</Link>
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

      <main className="flex-1 px-margin-desktop pt-32 pb-24 relative z-10 w-full max-w-[1440px] mx-auto">
        <div className="max-w-[1000px] mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary-container flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[32px] text-on-primary">code_blocks</span>
            </div>
            <div>
              <h1 className="font-display-hero text-[2.5rem] tracking-tight text-on-surface leading-none mb-2">GitHub Repositories</h1>
              <p className="text-on-surface-variant text-lg">Live feed of all repositories from Adityarane012</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="text-on-surface-variant">Fetching repositories...</div>
            ) : repos.map((repo) => (
              <a 
                href={repo.url} 
                target="_blank" 
                rel="noreferrer"
                key={repo.key} 
                className="group relative bg-surface-container/40 hover:bg-surface-container-high/60 backdrop-blur-sm rounded-xl p-6 border border-white/5 transition-all duration-300 block"
              >
                <div className="flex flex-col h-full justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-headline-md text-[1.1rem] text-primary group-hover:text-secondary transition-colors font-medium break-all">{repo.name}</h3>
                      <span className="material-symbols-outlined text-on-surface-variant text-[18px] opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
                    </div>
                    {repo.description && (
                      <p className="text-on-surface-variant text-sm line-clamp-2">{repo.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs font-code-sm text-on-surface-variant/70 mt-2">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">call_split</span>
                      {repo.commitCount} commits
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">update</span>
                      {new Date(repo.fetchedAt || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
