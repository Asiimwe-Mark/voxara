#!/usr/bin/env pwsh
# Webhook Configuration Script for Windows PowerShell
# This script helps you set up webhooks for Lemon Squeezy and Flutterwave

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Webhook Configuration Helper         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local file..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Host "✓ Created .env.local`n" -ForegroundColor Green
    }
    else {
        Write-Host "✗ .env.example not found. Please create .env.local manually.`n" -ForegroundColor Red
        exit 1
    }
}

# Function to update or add env variable
function Update-EnvVar($key, $value) {
    $envPath = ".env.local"
    $content = Get-Content $envPath
    
    if ($content | Select-String -Pattern "^$key=") {
        # Update existing
        $content = $content -replace "^$key=.*", "$key=$value"
    }
    else {
        # Add new
        $content += "`n$key=$value"
    }
    
    Set-Content $envPath $content -NoNewline
}

# Lemon Squeezy Setup
Write-Host "Step 1: Lemon Squeezy Webhook Configuration" -ForegroundColor Yellow
Write-Host "=============================================`n"
Write-Host "Follow these steps in Lemon Squeezy Dashboard:"
Write-Host "1. Go to https://app.lemonsqueezy.com/settings"
Write-Host "2. Navigate to 'API & Webhooks' → 'Webhooks'"
Write-Host "3. Click 'Create Webhook'"
Write-Host "4. Set the endpoint URL to:"
Write-Host "   https://yourdomain.com/api/stripe/webhook"
Write-Host ""
Write-Host "5. Enable these events:"
Write-Host "   ✓ order.created"
Write-Host "   ✓ order.completed"
Write-Host "   ✓ subscription.created"
Write-Host "   ✓ subscription.updated"
Write-Host "   ✓ subscription.cancelled"
Write-Host ""
Write-Host "6. Copy the webhook secret (looks like: whsec_...)"
Write-Host ""

$lemonSecret = Read-Host "Enter Lemon Squeezy Webhook Secret (or press Enter to skip)"

if ($lemonSecret) {
    Update-EnvVar "LEMON_SQUEEZY_WEBHOOK_SECRET" $lemonSecret
    Write-Host "✓ Lemon Squeezy webhook secret added`n" -ForegroundColor Green
}
else {
    Write-Host "✗ Skipped Lemon Squeezy configuration`n" -ForegroundColor Red
}

# Flutterwave Setup
Write-Host "Step 2: Flutterwave Webhook Configuration" -ForegroundColor Yellow
Write-Host "=============================================`n"
Write-Host "Follow these steps in Flutterwave Dashboard:"
Write-Host "1. Go to https://dashboard.flutterwave.com/settings"
Write-Host "2. Navigate to 'Webhooks'"
Write-Host "3. Set the endpoint URL to:"
Write-Host "   https://yourdomain.com/api/stripe/webhook"
Write-Host ""
Write-Host "4. Copy the webhook secret"
Write-Host ""

$flutterwaveSecret = Read-Host "Enter Flutterwave Webhook Secret (or press Enter to skip)"

if ($flutterwaveSecret) {
    Update-EnvVar "FLUTTERWAVE_WEBHOOK_SECRET" $flutterwaveSecret
    Write-Host "✓ Flutterwave webhook secret added`n" -ForegroundColor Green
}
else {
    Write-Host "✗ Skipped Flutterwave configuration`n" -ForegroundColor Red
}

# Verify Configuration
Write-Host "Step 3: Verify Configuration" -ForegroundColor Yellow
Write-Host "=============================================`n"
Write-Host "Current webhook configuration:`n"

$envContent = Get-Content ".env.local"
$webhookLines = $envContent | Select-String "WEBHOOK_SECRET"

if ($webhookLines) {
    foreach ($line in $webhookLines) {
        Write-Host $line -ForegroundColor Green
    }
}
else {
    Write-Host "No webhook secrets configured" -ForegroundColor Red
}

Write-Host "`n✓ Webhook configuration complete!`n" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Deploy your application with the new environment variables"
Write-Host "2. Test webhooks: npm run test:webhooks"
Write-Host "3. Monitor webhook logs in Supabase`n"

Write-Host "Environment file (.env.local) has been updated with:"
if ($lemonSecret -or $flutterwaveSecret) {
    Write-Host "✓ Webhook secrets configured`n" -ForegroundColor Green
}
