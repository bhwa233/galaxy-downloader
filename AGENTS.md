# Engineering conventions

- Reuse UI primitives in `src/components/ui/`; installed libraries are listed in `package.json` and UI configuration in `components.json`.
- Check source changes with `pnpm exec tsc --noEmit` and `pnpm lint`. Run `pnpm build` when changing routes or module boundaries.
- Use the existing Vitest suite (`pnpm test`, `tests/*.test.ts`) for relevant logic changes. UI layout and wiring changes can be verified in the browser without adding tests.
- Before adding or removing a test, check `package.json` and `vitest.config.ts` for explicit file references. Keep locale dictionary keys aligned across `src/lib/i18n/dictionaries/*.json` and `src/lib/i18n/types.ts`.
