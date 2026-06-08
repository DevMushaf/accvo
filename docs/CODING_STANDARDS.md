# Accvo Coding Standards

## TypeScript

- `strict: true` in tsconfig
- Define interfaces in `src/types/`
- Avoid `any`; use `unknown` and narrow when needed

## Naming

| Kind | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `InvoiceCard` |
| Hooks | camelCase, `use` prefix | `useInvoices` |
| Services | camelCase | `createInvoice` |
| Constants | UPPER_SNAKE or camelCase | `DEFAULT_SETTINGS` |
| Files | Match export | `invoiceRepository.ts` |

**Avoid:** `data1`, `temp`, `x`

## File organization

```
src/
├── components/   # Reusable UI
├── services/     # Data layer (SQLite, PDF, future API)
├── store/        # Zustand stores
├── hooks/        # Custom hooks
├── utils/        # Pure helpers
├── theme/        # Colors, spacing, typography
├── types/        # TypeScript interfaces
└── providers/    # React context providers
```

## Separation of concerns

```tsx
// Good — screen calls service
const invoice = await createInvoice(input);

// Bad — SQL in component
db.runAsync('INSERT INTO invoices ...');
```

## Error handling

- Wrap async user actions in try/catch
- Show `Alert.alert` with friendly messages
- Log errors in development; never expose stack traces to users

## Imports

- Use `@/` path alias for `src/`
- Group: React → external → internal → types

## Components

- Prefer functional components
- Keep screens thin; extract reusable UI to `components/`
- Use `useTheme()` for colors — no hardcoded hex in screens

## Git

See [GIT_WORKFLOW.md](GIT_WORKFLOW.md).
