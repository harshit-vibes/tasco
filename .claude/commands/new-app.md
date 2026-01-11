# Create New App

Scaffold a new Next.js 15 app in the monorepo.

## Arguments
- `name`: App name (lowercase, kebab-case)
- `business_unit`: Business unit (tasco-group, tasco-auto, tasco-insurance, inochi)

## Instructions

1. Create app directory structure:
```
apps/{name}/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css (import from @tasco/ui)
│   └── api/
├── components/
│   ├── app-shell.tsx
│   └── app-header.tsx
├── lib/
├── package.json
├── next.config.ts
├── tsconfig.json
└── tailwind.config.ts
```

2. Package.json template:
```json
{
  "name": "@tasco/{name}",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@tasco/api": "workspace:*",
    "@tasco/db": "workspace:*",
    "@tasco/lyzr": "workspace:*",
    "@tasco/ui": "workspace:*"
  },
  "devDependencies": {
    "@tasco/config": "workspace:*"
  }
}
```

3. Use shared packages:
- Import UI from `@tasco/ui`
- Import icons from `@tasco/ui/icons`
- Use ChatProvider from `@tasco/lyzr`
- Use API handlers from `@tasco/api`

4. Create app-specific agent if needed using `/setup-agent` command

## Output
- New app directory with all files
- Updated root package.json if needed
- Instructions for setting up environment variables
