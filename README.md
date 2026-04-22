# Señoría Hamburguesería

Sistema de pedidos y administración para local de hamburguesería.

## Quick Start

```bash
npm install
npm run dev
```

Abrir http://localhost:3000

## Usuarios

Ver `AGENTS.md` para credenciales.

## Tech Stack

- Next.js 14 (App Router)
- React + TypeScript
- Tailwind CSS
- JWT Auth
- JSON file storage

## Estructura

```
src/
├── app/
│   ├── api/          # API routes
│   ├── pedidos/      # Order taking
│   ├── cocina/       # Kitchen display
│   ├── caja/         # Cash management
│   ├── gastos/       # Expenses
│   └── reportes/     # Reports
├── lib/              # DB, auth utils
└── components/       # UI components
```

## Notas

- Los pedidos se guardan en `data/db.json`
- La cocina ve cada item individual
- Toppings son solo para hamburguesas
- Lomitos tienen ingredientes fijos con opción de omitir