# AGENTS.md - Señora Hamburguesa

## Commands
```bash
npm run dev    # Development server
npm run build  # Production build
```

## Design System

### UI Palette (Warm Minimal)
- Primary: `#de7b1c` (amber)
- Secondary: `#feca00` (gold)
- Background: `#feefb6` (cream)
- Text: `#2D2A26` (warm dark)
- Font: Outfit (Google Fonts)

### Cache Issue
If you encounter `Cannot find module ./vendor-chunks/tailwind-merge.js`:
```powershell
Remove-Item -Recurse -Force .next
npm run dev
```

### Port Conflicts
Next.js auto-increments port (3001, 3002...) if 3000 is busy.

### Layout Structure
All pages use a flex layout where:
- Navbar component: header + nav (shrink-0, no min-h-screen)
- Page container: `div className="min-h-screen flex flex-col"`
- Main content: `div className="flex-1 p-4 overflow-auto"`

### Database
Uses JSON file at `data/db.json` - NOT SQLite. The sql.js package is installed but not used.

## Users (seeded - example)

| Username | Password  | Role   |
|----------|-----------|--------|
| admin    | ${ADMIN_PASSWORD} | admin  |
| cajero   | ${CAJERO_PASSWORD}  | cajero |

> **Nota:** Los usuarios reales se encuentran en `data/db.json`. Change las contraseñas en producción.

## Routes

| Path | Description |
|-----|-------------|
| `/login` | Login page |
| `/pedidos` | Order list |
| `/pedidos/nueva` | New order |
| `/pedidos/[id]` | Order detail (dynamic) |
| `/cocina` | Kitchen display (all roles) |
| `/caja` | Cash open/close (all roles) |
| `/admin` | User & product management (admin only) |
| `/gastos` | Expenses (admin only) |
| `/reportes` | Daily report (admin only) |

## API Routes (Admin only)

| Path | Methods |
|-----|---------|
| `/api/usuarios` | GET, POST, PUT, DELETE |
| `/api/productos` | GET, PUT |

## Menu Structure

- **Hamburguesas**: toppings + aderezos selectable (checkboxes)
- **Lomitos**: fixed ingredients, client can omit any
- **Pizzas**: fixed recipes, no modifiers