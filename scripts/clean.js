#!/usr/bin/env node
/**
 * scripts/clean.js
 *
 * Three modes, all safe to run from any working directory:
 *
 *   pnpm clean           — removes build artefacts (dist, storybook-static,
 *                          coverage, .tsbuildinfo) across the whole monorepo.
 *                          Safe to run before a rebuild; leaves node_modules intact.
 *
 *   pnpm clean:dist      — same as above (alias for CI pipelines / habit)
 *
 *   pnpm nuke            — everything above PLUS every node_modules in every
 *                          workspace package. Run before a completely fresh
 *                          `pnpm install`. Takes longer but guarantees a clean slate.
 */

import { rmSync, existsSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'
import { fileURLToPath } from 'url'

const ROOT       = fileURLToPath(new URL('..', import.meta.url))
const args       = process.argv.slice(2)
const DIST_ONLY  = args.includes('--dist-only')
const NUKE       = args.includes('--nuke')

// ── Colours (no deps) ──────────────────────────────────────────────────────
const dim    = (s) => `\x1b[2m${s}\x1b[0m`
const green  = (s) => `\x1b[32m${s}\x1b[0m`
const yellow = (s) => `\x1b[33m${s}\x1b[0m`
const red    = (s) => `\x1b[31m${s}\x1b[0m`
const bold   = (s) => `\x1b[1m${s}\x1b[0m`

// ── What to remove ────────────────────────────────────────────────────────
// Build artefacts — always removed
const ARTEFACT_NAMES = new Set([
  'dist',
  'storybook-static',
  'coverage',
])

// TypeScript incremental build info files — matched by suffix
const ARTEFACT_SUFFIXES = ['.tsbuildinfo']

// Directories removed only with --nuke
const NUKE_NAMES = new Set([
  'node_modules',
])

// ── Workspace roots to scan ───────────────────────────────────────────────
// Read pnpm-workspace.yaml to find all package globs, then resolve them.
// We do a simple two-level scan (apps/*, packages/*) that matches this repo's
// structure rather than pulling in a YAML parser.
function getWorkspaceRoots() {
  const roots = [ROOT]
  for (const topDir of ['apps', 'packages']) {
    const topPath = join(ROOT, topDir)
    if (!existsSync(topPath)) continue
    for (const entry of readdirSync(topPath)) {
      const full = join(topPath, entry)
      if (statSync(full).isDirectory()) roots.push(full)
    }
  }
  return roots
}

// ── Remove helper ─────────────────────────────────────────────────────────
let removed = 0
let skipped = 0

function remove(fullPath) {
  const rel = relative(ROOT, fullPath)
  if (!existsSync(fullPath)) {
    skipped++
    return
  }
  try {
    rmSync(fullPath, { recursive: true, force: true })
    console.log(`  ${green('✓')} ${dim(rel)}`)
    removed++
  } catch (err) {
    console.error(`  ${red('✗')} ${rel} — ${err.message}`)
  }
}

// ── Main ──────────────────────────────────────────────────────────────────
const mode = NUKE ? 'nuke' : 'clean'
console.log()
console.log(bold(`▶ ${mode === 'nuke' ? red('nuke') : yellow('clean')} — ${ROOT}`))
console.log()

const roots = getWorkspaceRoots()

for (const pkgRoot of roots) {
  let entries
  try {
    entries = readdirSync(pkgRoot)
  } catch {
    continue
  }

  for (const entry of entries) {
    const full = join(pkgRoot, entry)

    // Always: remove named artefact directories
    if (ARTEFACT_NAMES.has(entry)) {
      remove(full)
      continue
    }

    // Always: remove .tsbuildinfo files
    if (ARTEFACT_SUFFIXES.some((s) => entry.endsWith(s))) {
      remove(full)
      continue
    }

    // Nuke mode only: remove node_modules
    if (NUKE && NUKE_NAMES.has(entry)) {
      remove(full)
    }
  }
}

// Summary
console.log()
console.log(`  ${bold('removed')} ${green(removed)} item(s)  ${dim(`(${skipped} already absent)`)}`)
console.log()

if (NUKE) {
  console.log(`  ${yellow('→')} Run ${bold('pnpm install')} to restore dependencies.`)
  console.log()
}
