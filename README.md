# Festalytics

Wedding and event planning platform with three surfaces:

- **B2C** — venue discovery, AI planner, event creation (`/all-venues`, `/ai-planner`, `/user-dashboard`)
- **B2B Vendor ERP** — bookings, messages, calendar, inventory (`/vendor-dashboard`)
- **Super Admin** — platform operations (`/admin`)

## Documentation

- **[Architecture guide](docs/ARCHITECTURE.md)** — routes, auth, Firestore model, API map

## Quick start

```powershell
# Frontend
cd d:\Festalytics\festalytics
npm install
npm run dev
# → http://localhost:3000

# AI backend (optional — AI Planner, Find Decor, Twilio)
cd backend
$env:PYTHONUTF8="1"
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --env-file .env --host 0.0.0.0 --port 8001
# → http://localhost:8001/health
```

Or run `.\scripts\start-dev.ps1` to open backend + frontend in separate terminals.

## Environment

| File | Purpose |
|------|---------|
| `.env.local` | Firebase Admin, Google Sheets, admin login, `NEXT_PUBLIC_AI_BACKEND_URL` |
| `backend/.env` | Groq, Twilio, `PUBLIC_BASE_URL` |

## Stack

Next.js 16 · React 19 · Tailwind 4 · Firebase · FastAPI (Python)
