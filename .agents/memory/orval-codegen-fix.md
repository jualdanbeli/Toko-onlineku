---
name: Orval codegen index.ts conflict fix
description: Orval regenerates lib/api-zod/src/index.ts with both api and types exports causing TS2308 duplicate export errors; must patch after orval runs.
---

## The Problem
When Orval runs codegen with `schemas: { path: "generated/types" }` config, it generates:
- `lib/api-zod/src/generated/api.ts` (Zod schemas for endpoints)
- `lib/api-zod/src/generated/types/` (TypeScript types, duplicates some Zod schema names)
- `lib/api-zod/src/index.ts` re-exports BOTH → TS2308 duplicate member errors

Even after removing the `schemas` option, Orval still generates the old `index.ts` with both exports.

## The Fix
1. Remove `schemas: { path: "generated/types", type: "typescript" }` from `lib/api-spec/orval.config.ts`'s zod output config
2. Patch `lib/api-spec/package.json` codegen script to overwrite `index.ts` after orval runs:

```json
"codegen": "orval --config ./orval.config.ts && node -e \"require('fs').writeFileSync(require('path').resolve(__dirname,'../api-zod/src/index.ts'),'export * from \\\"./generated/api\\\";\\n')\" && pnpm -w run typecheck:libs"
```

**Why:** Orval's `split` mode with `schemas` option generates duplicate type names in both `api.ts` and the types directory barrel. The patch forces index.ts to only export from `api.ts`.

**How to apply:** Any time codegen is modified, ensure the patch node script is still in the codegen command.
