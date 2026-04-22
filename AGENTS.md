# AGENTS.md -Señoría Hamburguesería

## Commands
```bash
npm run dev    # Development server
npm run build  # Production build
```

## Important Notes

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

## Users (seeded)

| Username | Password  | Role   |
|----------|-----------|--------|
| Benjamin | benjamin123 | cajero |
| Gonzalo  | gonzalo123  | admin  |

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