import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col overflow-hidden relative">
      
      {/* Animated Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary-container/20 blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />

      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container/70 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.1)] border-b border-white/5">
        <div className="h-16 w-full px-margin-desktop flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-headline-md text-headline-md tracking-tight text-on-surface hover:text-primary transition-colors">CommitGraph</Link>
            <nav className="hidden md:flex items-center gap-8 ml-8">
              <Link className="transition-colors text-on-surface-variant hover:text-on-surface font-label-caps text-label-caps" href="/repositories">Dashboard</Link>
              <Link className="font-label-caps text-label-caps text-on-surface-variant hover:text-on-surface transition-colors" href="/github">Repositories</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/repositories" 
              className="px-6 py-2 rounded-full bg-surface-container-high border border-outline-variant hover:border-primary/50 text-sm font-medium transition-all hover:bg-surface-container-highest"
            >
              Launch Prototype
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 mt-32">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          
          <h1 className="font-display-hero text-display-hero tracking-tighter mb-8 leading-[1.1] text-transparent bg-clip-text bg-gradient-to-r from-inverse-surface via-primary to-secondary">
            Software Reverse Engineering,<br/>Automated.
          </h1>
          
          <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mb-12 leading-relaxed">
            CommitGraph replaces manual feature-tagging with an LLM pipeline that ingests raw git commit history, analyzes diffs, and automatically clusters them into architectural graphs.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link 
              href="/repositories" 
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl overflow-hidden transition-all duration-500 hover:scale-[1.02] bg-gradient-to-r from-primary to-secondary-container text-on-primary shadow-lg shadow-primary/20"
            >
              <span className="font-bold tracking-wide">Enter the Dashboard</span>
              <span className="material-symbols-outlined transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
            </Link>
            <a 
              href="https://github.com/Adityarane012" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-surface-container border border-outline-variant hover:bg-surface-container-high transition-colors text-on-surface"
            >
              <span className="font-bold tracking-wide">View GitHub</span>
            </a>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full mt-32 mb-16">
          {[
            { icon: 'schema', title: 'Contextual Clustering', desc: 'LLaMA 3.3 dynamically infers feature boundaries from chaotic commit messages.' },
            { icon: 'speed', title: 'fs Cache Engine', desc: 'Sub-100ms response times for pre-indexed datasets, protecting live demos from rate limits.' },
            { icon: 'insights', title: 'Mermaid Generation', desc: 'Transforms raw mathematical clustering into beautiful, interactive dependency graphs.' }
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-2xl bg-surface-container/50 border border-white/5 backdrop-blur-sm flex flex-col items-start text-left hover:bg-surface-container-high transition-colors">
              <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
      
    </div>
  );
}
