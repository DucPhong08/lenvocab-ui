# Source structure

- `api/client/`: HTTP infrastructure such as request, config, JSON body and `ApiError`.
- `api/endpoints/`: functions that call backend endpoints.
- `api/mappers/`: pure response-to-domain transformations.
- `api/contracts.ts`: backend DTO types.
- `app/`: application shell, screen routing and bottom navigation.
- `components/`: reusable visual components used by multiple features.
- `data/`: local sample data and selectors.
- `hooks/`: hooks reusable across features.
- `screens/<feature>/`: screens plus feature-only `components/` and `hooks/`.
- `theme/`: colors, shadows and static image mapping.
- `types/`: contracts shared across the application.

## Conventions

- Use `.tsx` only when a file renders JSX; use `.ts` for hooks, data, types, API and styles.
- Keep one top-level function or component per file.
- Put a component in `components/` only when multiple features use it.
- Keep feature-only components and hooks inside that feature.
- Extract a hook when it owns meaningful state or side effects; keep simple state in its screen.
- Import concrete modules through the `@/` alias; do not add barrel `index.ts` files.
