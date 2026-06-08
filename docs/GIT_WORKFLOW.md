# Accvo Git Workflow

## Branch naming

```
feature/invoice-pdf
fix/offline-sync
docs/architecture
chore/expo-setup
```

## Commit format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(invoices): add PDF export and share sheet
feat(customers): basic CRUD with SQLite
feat(theme): dark mode and brand color tokens
docs: add architecture and API documentation
chore(mobile): init Expo app with TypeScript
fix(pdf): handle share unavailable on device
```

## Commit cadence

One logical unit per commit:

1. Scaffold / monorepo structure
2. Theme and splash
3. Database layer
4. Each feature area (invoices, customers, settings)
5. Documentation updates

## Pull request checklist

- [ ] TypeScript compiles without errors
- [ ] App runs on Android (Expo Go or emulator)
- [ ] No secrets in committed files
- [ ] Docs updated if schema or architecture changed

## What not to commit

- `.env` files
- `node_modules/`
- Firebase service account keys
- API keys (OpenAI, Stripe)

Use `.env.example` for documented variable names only.
