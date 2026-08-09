/**
 * Fetch commit history from GitHub REST API for specified repos.
 * Run: node scripts/fetch-commits.js
 * 
 * Saves to public/data/{repo-key}/commits.json
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const REPOS = [
  { key: 'blackout', owner: 'Adityarane012', repo: 'Blackout', description: 'A power outage tracking application' },
  { key: 'supplysetu-ai', owner: 'Adityarane012', repo: 'SupplySetu-AI', description: 'AI-powered supply chain management' },
  { key: 'studypilot', owner: 'Adityarane012', repo: 'StudyPilot', description: 'AI agentic study planner for students' },
  { key: 'docendo', owner: 'Adityarane012', repo: 'Docendo', description: 'Documentation tool' },
  { key: 'careerflow', owner: 'Adityarane012', repo: 'CareerFlow', description: 'Career management application' },
];

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'StudyPilot-CommitFetcher',
        'Accept': 'application/vnd.github.v3+json',
      },
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 200)}`));
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`JSON parse error: ${e.message}`));
        }
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function fetchCommitsForRepo({ key, owner, repo, description }) {
  console.log(`\n📦 Fetching commits for ${owner}/${repo}...`);
  
  const allCommits = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100&page=${page}`;
    const commits = await fetchJSON(url);
    
    if (!Array.isArray(commits) || commits.length === 0) {
      hasMore = false;
      break;
    }

    for (const c of commits) {
      allCommits.push({
        sha: c.sha,
        message: c.commit.message,
        author: c.commit.author.name,
        date: c.commit.author.date,
        url: c.html_url,
      });
    }

    if (commits.length < 100) {
      hasMore = false;
    }
    page++;
  }

  // Now fetch file stats for each commit (limited to keep under rate limits)
  console.log(`   Found ${allCommits.length} commits. Fetching file stats...`);
  
  for (let i = 0; i < allCommits.length; i++) {
    const commit = allCommits[i];
    try {
      const detail = await fetchJSON(`https://api.github.com/repos/${owner}/${repo}/commits/${commit.sha}`);
      commit.files = (detail.files || []).map(f => ({
        filename: f.filename,
        status: f.status,
        additions: f.additions,
        deletions: f.deletions,
        changes: f.changes,
      }));
      commit.stats = detail.stats || { additions: 0, deletions: 0, total: 0 };
    } catch (err) {
      console.warn(`   ⚠️ Could not fetch details for ${commit.sha.substring(0, 7)}: ${err.message}`);
      commit.files = [];
      commit.stats = { additions: 0, deletions: 0, total: 0 };
    }
    
    // Rate limit: be gentle (unauthenticated = 60 req/hr)
    // With 5 repos * ~30 commits each = ~150 detail requests
    // We might hit the limit. Add a small delay.
    if (i % 10 === 9) {
      console.log(`   ... processed ${i + 1}/${allCommits.length}`);
    }
    await new Promise(r => setTimeout(r, 100)); // 100ms delay between requests
  }

  const outputDir = path.join(__dirname, '..', 'public', 'data', key);
  fs.mkdirSync(outputDir, { recursive: true });

  const output = {
    repo: {
      key,
      name: repo,
      owner,
      description,
      url: `https://github.com/${owner}/${repo}`,
      commitCount: allCommits.length,
      fetchedAt: new Date().toISOString(),
    },
    commits: allCommits,
  };

  const outputFile = path.join(outputDir, 'commits.json');
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
  console.log(`   ✅ Saved ${allCommits.length} commits to ${outputFile}`);
  
  return output;
}

async function main() {
  console.log('🚀 StudyPilot Commit Fetcher');
  console.log('============================\n');
  console.log(`Fetching commits for ${REPOS.length} repositories...\n`);

  const results = [];
  
  for (const repo of REPOS) {
    try {
      const result = await fetchCommitsForRepo(repo);
      results.push(result);
    } catch (err) {
      console.error(`❌ Failed to fetch ${repo.repo}: ${err.message}`);
    }
  }

  // Write a summary repos.json
  const summaryDir = path.join(__dirname, '..', 'public', 'data');
  const summary = results.map(r => r.repo);
  fs.writeFileSync(path.join(summaryDir, 'repos.json'), JSON.stringify(summary, null, 2));
  console.log(`\n✅ All done! Summary saved to public/data/repos.json`);
  console.log(`   Total repos: ${results.length}`);
  console.log(`   Total commits: ${results.reduce((sum, r) => sum + r.commits.length, 0)}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
