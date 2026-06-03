# Festalytics — start frontend + backend (run in separate terminals or use this script)
# Prerequisites: Python 3.12, Node.js, backend/.env with API keys

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Backend = Join-Path $Root "backend"
$Py = "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe"

if (-not (Test-Path $Py)) {
    Write-Host "Python not found at $Py. Install Python 3.12 or update the path in this script."
    exit 1
}

$env:PYTHONUTF8 = "1"
$env:PYTHONIOENCODING = "utf-8"

Write-Host "Starting backend on http://localhost:8001 ..."
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$Backend'; `$env:PYTHONUTF8='1'; & '$Py' -m uvicorn app.main:app --reload --env-file .env --host 0.0.0.0 --port 8001"
) -WorkingDirectory $Backend

Start-Sleep -Seconds 2

Write-Host "Starting frontend on http://localhost:3000 ..."
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$Root'; npm run dev"
) -WorkingDirectory $Root

Write-Host ""
Write-Host "Done. Open:"
Write-Host "  Frontend:  http://localhost:3000"
Write-Host "  Backend:   http://localhost:8001/health"
Write-Host ""
Write-Host "For ngrok (after: ngrok config add-authtoken YOUR_TOKEN):"
Write-Host "  ngrok http --domain=evade-matchbook-fleshy.ngrok-free.dev 8001"
Write-Host "  Then set NEXT_PUBLIC_AI_BACKEND_URL=https://evade-matchbook-fleshy.ngrok-free.dev in .env.local"
