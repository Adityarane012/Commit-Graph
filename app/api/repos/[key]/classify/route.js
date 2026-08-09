import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import fs from 'fs';
import path from 'path';


const SYSTEM_PROMPT = `You are a software feature classifier. Given a git commit (message + file diff stats), your job is to infer which high-level software FEATURE this commit belongs to.

Rules:
1. Prefer user-facing or architectural feature names (e.g., "Authentication System", "Dashboard UI", "API Integration") over restating the commit message.
2. Use "Maintenance / Infra" for pure bugfixes, config changes, dependency bumps, or CI/CD changes with no clear feature.
3. Use "Project Setup" for initial project scaffolding, boilerplate, README updates.
4. Set confidence to "low" when the commit message is too vague to infer a feature.
5. Group related work under the SAME feature name — be consistent. Don't create 10 different names for what is obviously one feature.
6. Keep feature names SHORT (2-4 words max).

Respond with ONLY valid JSON, no markdown, no explanation:
{"feature_name": "...", "confidence": "high|medium|low", "reasoning": "one sentence explaining why"}`;

async function classifyCommit(commit, groq, establishedFeatures = []) {
  const fileList = (commit.files || [])
    .map(f => `  ${f.status}: ${f.filename} (+${f.additions}/-${f.deletions})`)
    .join('\n');

  let dynamicSystemPrompt = SYSTEM_PROMPT;
  if (establishedFeatures.length > 0) {
    dynamicSystemPrompt += `\n\nCRITICAL CONTEXT: Established features in this repository so far: [${establishedFeatures.join(', ')}]. If the commit matches one of these existing features, YOU MUST USE THE EXACT EXISTING NAME. Do not invent a new name if an existing one fits perfectly.`;
  }

  const userPrompt = `Commit SHA: ${commit.sha.substring(0, 7)}
Message: ${commit.message}
Date: ${commit.date}
Files changed:
${fileList || '  (no file data available)'}
Stats: +${commit.stats?.additions || 0}/-${commit.stats?.deletions || 0} (${commit.stats?.total || 0} total)`;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: dynamicSystemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 200,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw);
    return {
      sha: commit.sha,
      message: commit.message,
      date: commit.date,
      files: commit.files,
      stats: commit.stats,
      classification: {
        feature_name: parsed.feature_name || 'Unknown',
        confidence: parsed.confidence || 'low',
        reasoning: parsed.reasoning || 'No reasoning provided',
      },
    };
  } catch (error) {
    console.error(`Classification error for ${commit.sha.substring(0, 7)}:`, error.message);
    // Return null to silently skip this commit on failure (avoids ugly error nodes in the graph)
    return null;
  }
}

export async function POST(request, { params }) {
  try {
    const { key } = await params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    const cacheDir = path.join(process.cwd(), '.cache');
    const cacheFile = path.join(cacheDir, `${key}_results.json`);

    // Return cached results instantly unless forced
    if (!force && fs.existsSync(cacheFile)) {
      try {
        const cachedData = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
        return NextResponse.json(cachedData);
      } catch (err) {
        console.warn('Cache read error, recomputing...', err);
      }
    }
    const commitsFile = path.join(process.cwd(), 'public', 'data', key, 'commits.json');
    
    if (!fs.existsSync(commitsFile)) {
      return NextResponse.json({ error: `Repo '${key}' not found` }, { status: 404 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const data = JSON.parse(fs.readFileSync(commitsFile, 'utf-8'));
    
    // Skip initial commit (per project design — bootstrap commits aren't features)
    const commits = data.commits.slice(0, -1); // Last item is the initial commit (oldest)

    const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    // Classify commits in batches for speed, passing established features for consistency
    const results = [];
    const batchSize = 2; // Safe batch size for Groq Free Tier (30 RPM)
    const establishedFeatures = new Set();
    
    for (let i = 0; i < commits.length; i += batchSize) {
      const chunk = commits.slice(i, i + batchSize);
      
      const chunkResults = await Promise.all(
        chunk.map(commit => classifyCommit(commit, groqClient, Array.from(establishedFeatures)))
      );
      
      // Accumulate results and context
      for (const res of chunkResults) {
        if (!res) continue; // Skip failed commits
        
        results.push(res);
        if (res.classification.confidence !== 'low') {
          establishedFeatures.add(res.classification.feature_name);
        }
      }
      
      // Delay to avoid 429 Too Many Requests (if not the last batch)
      if (i + batchSize < commits.length) {
        await new Promise(r => setTimeout(r, 2500));
      }
    }

    // Group by feature
    const featureGroups = {};
    for (const r of results) {
      const feature = r.classification.feature_name;
      if (!featureGroups[feature]) {
        featureGroups[feature] = {
          feature_name: feature,
          commits: [],
          commitCount: 0,
          confidences: { high: 0, medium: 0, low: 0 },
        };
      }
      featureGroups[feature].commits.push(r);
      featureGroups[feature].commitCount++;
      featureGroups[feature].confidences[r.classification.confidence]++;
    }

    // Generate Mermaid diagram
    const features = Object.values(featureGroups);
    let mermaid = 'graph TD\n';
    mermaid += `  ROOT["${data.repo.name}"]:::root\n`;
    
    features.forEach((f, i) => {
      const nodeId = `F${i}`;
      const label = f.feature_name.replace(/"/g, "'");
      const avgConfidence = f.confidences.high >= f.commitCount / 2 ? 'high' : 
                           f.confidences.medium >= f.commitCount / 2 ? 'medium' : 'low';
      mermaid += `  ${nodeId}["${label} (${f.commitCount})"]:::${avgConfidence}\n`;
      mermaid += `  ROOT --> ${nodeId}\n`;
    });

    mermaid += '\n  classDef root fill:#6366f1,stroke:#4f46e5,color:#fff,font-weight:bold\n';
    mermaid += '  classDef high fill:#10b981,stroke:#059669,color:#fff\n';
    mermaid += '  classDef medium fill:#f59e0b,stroke:#d97706,color:#fff\n';
    mermaid += '  classDef low fill:#ef4444,stroke:#dc2626,color:#fff\n';

    const finalPayload = {
      repo: data.repo,
      totalCommits: commits.length,
      skippedInitialCommit: true,
      featureGroups: features,
      mermaidDiagram: mermaid,
      classifiedCommits: results,
    };

    // Save to cache
    try {
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
      fs.writeFileSync(cacheFile, JSON.stringify(finalPayload, null, 2));
    } catch (err) {
      console.warn('Failed to write cache file:', err);
    }

    return NextResponse.json(finalPayload);
  } catch (error) {
    console.error('Classification route error:', error);
    return NextResponse.json({ error: 'Classification failed', details: error.message }, { status: 500 });
  }
}
