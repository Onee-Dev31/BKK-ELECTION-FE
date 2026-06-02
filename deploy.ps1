$SERVER_IP     = "10.31.1.81"
$SERVER_USER   = "Administrator"
$SERVER_DOMAIN = "ONEE-INTELECTION"
$SERVER_PASS   = "MsaV(Q*UenvF"
$SITE_NAME     = "BangkokElectionFE"
$REMOTE_PATH   = "\\$SERVER_IP\C$\inetpub\$SITE_NAME"
$DIST_PATH     = "dist\governor-bkk\browser"

$secPass = ConvertTo-SecureString $SERVER_PASS -AsPlainText -Force
$cred    = New-Object PSCredential("$SERVER_DOMAIN\$SERVER_USER", $secPass)

Write-Host "==> Building production..."
npx ng build --configuration production
if ($LASTEXITCODE -ne 0) { Write-Error "Build failed"; exit 1 }

Write-Host "==> Connecting to server share..."
net use $REMOTE_PATH $SERVER_PASS /user:"$SERVER_DOMAIN\$SERVER_USER" | Out-Null

Write-Host "==> Copying files..."
robocopy $DIST_PATH $REMOTE_PATH /MIR
# robocopy exit codes 0-7 are success (8+ = real errors)
if ($LASTEXITCODE -ge 8) { Write-Error "robocopy failed (exit $LASTEXITCODE)"; net use $REMOTE_PATH /delete | Out-Null; exit 1 }

Write-Host "==> Clearing hidden attributes..."
attrib -h -s -r "$REMOTE_PATH\*.*" /S /D
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Could not clear attributes on the remote share (exit $LASTEXITCODE). Continuing..."
} else {
    Write-Host "Attributes cleared"
}

Write-Host "==> Disconnecting..."
net use $REMOTE_PATH /delete | Out-Null

Write-Host "==> Restarting IIS App Pool..."
try {
    Invoke-Command -ComputerName $SERVER_IP -Port 5985 -Authentication Negotiate -Credential $cred `
        -ScriptBlock {
            param($siteName)
            Import-Module WebAdministration
            Restart-WebAppPool -Name $siteName
        } -ArgumentList $SITE_NAME -ErrorAction Stop
    Write-Host "App Pool restarted"
} catch {
    Write-Warning "Deploy copied files successfully, but IIS App Pool restart was skipped because PowerShell Remoting was denied."
    Write-Warning "Reason: $($_.Exception.Message)"
}

Write-Host "==> Deploy complete! http://${SERVER_IP}:3000"
