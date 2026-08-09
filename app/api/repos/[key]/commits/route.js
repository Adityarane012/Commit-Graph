import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  try {
    const { key } = await params;
    const commitsFile = path.join(process.cwd(), 'public', 'data', key, 'commits.json');
    
    if (!fs.existsSync(commitsFile)) {
      return NextResponse.json({ error: `Repo '${key}' not found` }, { status: 404 });
    }

    const data = JSON.parse(fs.readFileSync(commitsFile, 'utf-8'));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load commits', details: error.message }, { status: 500 });
  }
}
