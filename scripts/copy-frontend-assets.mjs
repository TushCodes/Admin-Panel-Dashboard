import { cp, mkdir } from 'node:fs/promises';

const source = new URL('../frontend/assets/', import.meta.url);
const target = new URL('../frontend/dist/assets/', import.meta.url);

await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });
console.log(`Copied frontend assets to ${target.pathname}`);
