const fs = require('fs');
const path = require('path');

// Read the lint errors file
const lintErrorsPath = path.join(__dirname, 'current-lint-errors.txt');
const lintOutput = fs.readFileSync(lintErrorsPath, 'utf-8');

const lines = lintOutput.split('\n');
const errors = [];
let currentFile = null;

// Parse the lint output
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Match file path on any OS (absolute or relative)
  // Examples:
  // - C:\repo\file.tsx
  // - /home/user/repo/file.tsx
  // - components/Foo.tsx
  // - ./components/Foo.tsx
  const fileMatch = line.match(/^(.*\.(?:tsx|jsx|ts|js))$/);
  if (fileMatch) {
    currentFile = fileMatch[1];
    continue;
  }

  // Match error line: "  LINE:COL  error    JSX element is missing a data-cy attribute"
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

console.log(
  `Found ${errors.length} data-cy errors in ${new Set(errors.map((e) => e.file)).size} files`,
);

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

for (const filePath of Object.keys(byFile)) {
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

      // Skip if already has data-cy
      if (lineStr.includes('data-cy=')) return;

      const col0 = col - 1;
      // Find the opening tag
      const openBracket = lineStr.indexOf('<', col0);
      let tagStart = openBracket >= 0 ? openBracket : lineStr.indexOf('<');
      if (tagStart < 0) return;

      const afterOpen = lineStr.slice(tagStart + 1);
      // Match tag name (e.g., "div", "span", "svg", "path")
      const tagMatch = afterOpen.match(/^([a-z][a-z0-9]*)\s/);
      const tagMatch2 = afterOpen.match(/^([a-z][a-z0-9]*)>/);
      const tagMatch3 = afterOpen.match(/^([a-z][a-z0-9]*)$/);
      const tagName = tagMatch
        ? tagMatch[1]
        : tagMatch2
          ? tagMatch2[1]
          : tagMatch3
            ? tagMatch3[1]
            : null;
      if (!tagName) return;

      // Find where to insert (after tag name, before closing > or space)
      const tagEnd = tagStart + 1 + tagName.length;
      const nextChar = lineStr[tagEnd];

      let insertPos;
      if (nextChar === '>' || nextChar === ' ' || nextChar === '\t') {
        // Find the position after tag name, before attributes or closing
        insertPos = tagEnd;
        // Skip whitespace to find where attributes start
        while (lineStr[insertPos] === ' ' || lineStr[insertPos] === '\t') {
          insertPos++;
        }
        // If we hit >, insert before it
        if (lineStr[insertPos] === '>') {
          insertPos = tagEnd;
        }
      } else {
        insertPos = tagEnd;
      }

      const dataCy = `${context}-${baseName}-${tagName}-${line}`
        .toLowerCase()
        .replace(/-+/g, '-');
      const insertion = ` data-cy="${dataCy}"`;

      fileLines[idx] =
        lineStr.slice(0, insertPos) + insertion + lineStr.slice(insertPos);
      totalFixed++;
    });

    fs.writeFileSync(filePath, fileLines.join('\n'), 'utf-8');
    console.log(
      `Fixed ${entries.length} errors in ${path.relative(process.cwd(), filePath)}`,
    );
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err.message);
  }
}

console.log(`\nTotal fixed: ${totalFixed}`);
