import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';


const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
const rewrites = new Map(
    (vercel.rewrites || []).map(({ source, destination }) => [source, destination]),
);
const htmlFiles = fs.readdirSync(publicDir).filter((file) => file.endsWith('.html'));
const failures = [];
let checked = 0;


function destinationFor(sourceFile, hrefPath) {
    if (!hrefPath || hrefPath === '/') return '/index.html';
    if (hrefPath.startsWith('/')) return rewrites.get(hrefPath) || hrefPath;
    return path.posix.join('/', path.posix.dirname(sourceFile), hrefPath);
}


for (const sourceFile of htmlFiles) {
    const source = fs.readFileSync(path.join(publicDir, sourceFile), 'utf8');
    const links = [...source.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)].map((match) => match[1]);

    for (const href of links) {
        if (/^(?:https?:|mailto:|tel:|javascript:)/i.test(href)) continue;

        const [rawPath, fragment = ''] = href.split('#', 2);
        const hrefPath = rawPath.split('?', 1)[0];
        const destination = destinationFor(sourceFile, hrefPath);
        const targetPath = path.join(publicDir, destination.replace(/^\//, ''));
        checked += 1;

        if (!fs.existsSync(targetPath)) {
            failures.push(`${sourceFile}: ${href} -> missing ${destination}`);
            continue;
        }

        if (fragment && targetPath.endsWith('.html')) {
            const target = fs.readFileSync(targetPath, 'utf8');
            const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            if (!new RegExp(`\\bid=["']${escaped}["']`).test(target)) {
                failures.push(`${sourceFile}: ${href} -> missing #${fragment}`);
            }
        }
    }
}


if (failures.length) {
    console.error(failures.join('\n'));
    process.exit(1);
}

console.log(`Checked ${checked} internal links across ${htmlFiles.length} HTML files.`);
