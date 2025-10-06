# BudgetPal Frontend (React + Vite)

## Setup
```bash
cd Frontend
npm install
npm run dev
```

Default dev server: `http://localhost:5173`

## Environment Configuration
Create `src/config.js` to point to your backend API:
```javascript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
```

Or set `.env`:
```
VITE_API_BASE_URL=http://localhost:3000
```

## Relevant Backend Endpoints
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/emergency-question/:username`
- `PUT /api/auth/set-emergency-question`
- `POST /api/groups/` — create group
- `POST /api/groups/:groupId/members` — add member
- `POST /api/groups/:groupId/expenses` — create expense
- `GET /api/groups/:groupId/balance` — settlement plan

## Build
```bash
npm run build
npm run preview
```
