#!/usr/bin/env bun
import { $ } from 'bun';

const msg = process.argv.slice(2).join(' ') || 'update: commit via bun script';

await $`git add .`;
await $`git commit -m "${msg}"`;
await $`git push`;
await $`git pull origin main`;
await $`git checkout main`;
await $`git merge kyle`;
await $`git push -u origin main`;
await $`git checkout kyle`;
await $`git pull origin main`;
