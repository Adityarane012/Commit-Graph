"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Redirect to dashboard on success
        router.push('/');
        router.refresh(); // Force refresh to apply middleware state
      } else {
        setError(data.error || 'Invalid password. Hint: devengers2026');
      }
    } catch (err) {
      setError('Failed to connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen bg-surface flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0 overflow-hidden">
        <svg className="absolute w-[800px] h-[800px] top-[10%] -left-[200px] blur-[120px]" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle className="text-primary/30" cx="100" cy="100" fill="currentColor" r="100"></circle>
        </svg>
        <svg className="absolute w-[600px] h-[600px] bottom-[10%] right-[5%] blur-[100px]" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle className="text-secondary-container/20" cx="100" cy="100" fill="currentColor" r="100"></circle>
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-8 gap-4">
          <span className="material-symbols-outlined text-primary text-[48px]">account_tree</span>
          <h1 className="font-display-hero text-[2rem] md:text-[2.5rem] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary">
            CommitGraph
          </h1>
          <p className="font-body-md text-on-surface-variant text-center">
            Sign in to access the Hack Devengers prototype.
          </p>
        </div>

        <form onSubmit={handleLogin} className="bg-surface-container/60 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider" htmlFor="password">
              Access Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                lock
              </span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter hackathon password"
                className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/50"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-error-container/20 border border-error/30 rounded-lg text-error text-[14px]">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full relative group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg overflow-hidden transition-all duration-300 ${loading ? 'bg-surface-container-high cursor-wait' : 'bg-gradient-to-r from-primary to-secondary-container hover:scale-[1.02]'}`}
          >
            {!loading && (
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            )}
            <span className={`font-label-caps text-label-caps ${loading ? 'text-on-surface-variant' : 'text-on-primary'} relative z-10 font-bold uppercase tracking-wider`}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </span>
            {!loading && (
              <span className="material-symbols-outlined text-on-primary text-[18px] relative z-10 transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="font-code-sm text-[12px] text-on-surface-variant/70">
            For Hack Devengers 1.0 Judges: Use password <span className="text-primary">devengers2026</span>
          </p>
        </div>
      </div>
    </main>
  );
}
