import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'public', 'data');
    const reposFile = path.join(dataDir, 'repos.json');
    
    if (fs.existsSync(reposFile)) {
      const repos = JSON.parse(fs.readFileSync(reposFile, 'utf-8'));
      return NextResponse.json({ repos });
    }

    // Fallback: scan data directories
    const dirs = fs.readdirSync(dataDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => {
        const commitsFile = path.join(dataDir, d.name, 'commits.json');
        if (fs.existsSync(commitsFile)) {
          const data = JSON.parse(fs.readFileSync(commitsFile, 'utf-8'));
          return data.repo;
        }
        return null;
      })
      .filter(Boolean);

    return NextResponse.json({ repos: dirs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load repos', details: error.message }, { status: 500 });
  }
}
