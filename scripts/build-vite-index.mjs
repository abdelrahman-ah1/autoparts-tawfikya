import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const legacyPath = path.join(root, 'legacy', 'index.html')
const sourcePath = fs.existsSync(legacyPath)
  ? legacyPath
  : path.join(root, 'index.html')

const html = fs.readFileSync(sourcePath, 'utf8')
const twMatch = html.match(/<script id="tailwind-config">[\s\S]*?<\/script>/)
if (!twMatch) {
  console.error('tailwind-config script not found')
  process.exit(1)
}

const out = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AutoParts Marketplace</title>
  <link href="https://fonts.googleapis.com" rel="preconnect" />
  <link crossorigin href="https://fonts.gstatic.com" rel="preconnect" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@500;600&amp;display=swap" rel="stylesheet" />
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  ${twMatch[0]}
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
`

fs.writeFileSync(path.join(root, 'index.html'), out, 'utf8')
console.log('Wrote index.html for Vite')
