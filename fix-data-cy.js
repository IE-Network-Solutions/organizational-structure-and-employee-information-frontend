const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Run lint and capture output
// console.log('Running lint to get errors...');
let lintOutput;
try {
  lintOutput = execSync('npm run lint 2>&1', {
    encoding: 'utf-8',
    maxBuffer: 15 * 1024 * 1024,
  });
} catch (e) {
  lintOutput = (e.stdout || '') + (e.stderr || '');
}

const lines = lintOutput.split('\n');
const errors = [];
let currentFile = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Match file path on any OS (absolute or relative)
  // Examples:
  // - C:\repo\file.tsx
  // - /home/user/repo/file.tsx
  // - components/Foo.tsx
  // - ./components/Foo.tsx
  const fileMatch = line.match(/^(.*\.(?:tsx|jsx))$/);
  if (fileMatch) {
    currentFile = fileMatch[1];
    continue;
  }
  // Match "  LINE:COL  error  JSX element is missing a data-cy"
  const errorMatch = line.match(
    /^\s*(\d+):(\d+)\s+error\s+JSX element is missing a data-cy attribute/,
  );
  if (errorMatch && currentFile) {
    errors.push({
      file: currentFile,
      line: parseInt(errorMatch[1], 10),
      col: parseInt(errorMatch[2], 10),
    });
  }
}

// console.log(
//   `Found ${errors.length} data-cy errors in ${new Set(errors.map((e) => e.file)).size} files`,
// );

// Group by file, keep line and col for precise fix
const byFile = {};
errors.forEach(({ file, line, col }) => {
  if (!byFile[file]) byFile[file] = [];
  byFile[file].push({ line, col });
});

// Sort by line descending so we don't shift positions when inserting
Object.keys(byFile).forEach((f) =>
  byFile[f].sort((a, b) => b.line - a.line || b.col - a.col),
);

let totalFixed = 0;
const BATCH_SIZE = 600;
const filePaths = Object.keys(byFile);

for (const filePath of filePaths) {
  if (totalFixed >= BATCH_SIZE) break;

  const entries = byFile[filePath];
  if (!entries.length) continue;

  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const fileLines = content.split('\n');
    const baseName = path.basename(filePath, path.extname(filePath));
    const dirParts = filePath.split(path.sep).filter(Boolean);
    const context =
      dirParts
        .slice(-4)
        .join('-')
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-') || 'app';

    entries.forEach(({ line, col }) => {
      const idx = line - 1;
      if (idx < 0 || idx >= fileLines.length) return;
      let lineStr = fileLines[idx];
      if (lineStr.includes('data-cy=')) return;

      const col0 = col - 1;
      const openBracket = lineStr.indexOf('<', col0);
      let tagStart = openBracket >= 0 ? openBracket : lineStr.indexOf('<');
      if (tagStart < 0) return;

      const afterOpen = lineStr.slice(tagStart + 1);
      const tagMatch = afterOpen.match(/^([a-z][a-z0-9]*)\s/);
      const tagMatch2 = afterOpen.match(/^([a-z][a-z0-9]*)>/);
      const tagName = tagMatch ? tagMatch[1] : tagMatch2 ? tagMatch2[1] : null;
      if (!tagName) return;

      const insertPos = tagStart + 1 + tagName.length;
      const dataCy = `${context}-${baseName}-${tagName}-${line}`
        .toLowerCase()
        .replace(/-+/g, '-');
      const insertion = ` data-cy="${dataCy}"`;

      fileLines[idx] =
        lineStr.slice(0, insertPos) + insertion + lineStr.slice(insertPos);
      totalFixed++;
    });

    fs.writeFileSync(filePath, fileLines.join('\n'), 'utf-8');
    // console.log(
    //   `Fixed ${entries.length} errors in ${path.relative(process.cwd(), filePath)}`,
    // );
  } catch (err) {
    // console.error(`Error processing ${filePath}:`, err.message);
  }
}

// console.log(`\nTotal fixed in this run: ${totalFixed}`);
if (totalFixed > 0) {
  // console.log(
  //   'Run "npm run lint" to check remaining errors, then run this script again to fix more.',
  // );
}
