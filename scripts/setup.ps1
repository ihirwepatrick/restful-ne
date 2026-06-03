# TZW Fire Safety - Setup Script (Windows PowerShell)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "Starting PostgreSQL databases..."
docker compose up -d
Start-Sleep -Seconds 8

Write-Host "Installing dependencies..."
npm install

Write-Host "Building shared package..."
npm run build -w @tzw/shared

Write-Host "Pushing Prisma schemas..."
$env:AUTH_DATABASE_URL = "postgresql://postgres:postgres@localhost:5436/fire_auth"
$env:EQUIPMENT_DATABASE_URL = "postgresql://postgres:postgres@localhost:5433/fire_equipment"
$env:OPERATIONS_DATABASE_URL = "postgresql://postgres:postgres@localhost:5434/fire_operations"
$env:REPORTING_DATABASE_URL = "postgresql://postgres:postgres@localhost:5435/fire_reporting"

npm run db:generate -w @tzw/auth-service
npm run db:push -w @tzw/auth-service

npm run db:generate -w @tzw/equipment-service
npm run db:push -w @tzw/equipment-service
npm run db:seed -w @tzw/equipment-service

npm run db:generate -w @tzw/operations-service
npm run db:push -w @tzw/operations-service

npm run db:generate -w @tzw/reporting-service
npm run db:push -w @tzw/reporting-service

Write-Host "Setup complete! Copy .env.example to .env and configure Gmail SMTP."
Write-Host "Start services: npm run dev:auth, dev:equipment, dev:operations, dev:reporting, dev:gateway, dev:client"
