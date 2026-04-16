# Pages note

The folders inside `src/pages` are grouped by feature so the codebase stays easier to read and grow over time.

Examples:

- `practice/`
- `planner/`
- `officeTips/`

Inside each feature, the structure is intentionally simple:

- `FeaturePage.tsx`: the main page file, mostly responsible for page layout and wiring pieces together
- `components/`: UI pieces that render JSX
- `hooks/`: custom hooks for state, actions, filtering, or orchestration
- `utils.ts`: pure helpers, no UI rendering
- `types.ts`: shared types for the feature
- `data.ts` / `storage.ts` / `pdf.ts`: optional support files when a feature needs them

A quick rule of thumb:

- if a file contains a lot of `div`, `Card`, `Button`, or JSX in general, it probably belongs in `components/` or the main `FeaturePage.tsx`
- if a file mostly transforms data, formats values, filters lists, or builds objects, it should live in `utils.ts` or another logic-focused file
- if a file is named `types`, `utils`, `storage`, or `pdf`, try to keep it UI-free

When adding a new file, the current preference is:

1. If it only belongs to one feature, keep it inside that feature folder
2. If it renders UI, put it in `components/`
3. If it mainly handles state or actions, put it in `hooks/`
4. If it is a small helper, keep it in `utils.ts`

The goal here is not to create a huge architecture for the sake of it. The goal is just:

- open a folder and understand it quickly
- know where a new file should go
- work on one feature without jumping around the whole repo

If a feature grows more later, it can be split a little further, for example:

- `components/forms/`
- `components/cards/`
- `hooks/useSomething.ts`

For now, this level feels like a good balance between clean structure and day-to-day speed.
