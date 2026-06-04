#!/bin/bash
set -e

SERVER_IP="10.31.1.81"
SERVER_USER="administrator"
SERVER_DOMAIN="ONEE-INTELECTION"
SERVER_PASS='MsaV(Q*UenvF'
SITE_NAME="BangkokElectionFE"
MOUNT_POINT="/tmp/WinServer2019FE"
REMOTE_PATH="inetpub/${SITE_NAME}"
DIST_PATH="dist/governor-bkk/browser"

echo "==> Building production..."
npx ng build --configuration production

echo "==> Mounting SMB..."
ENCODED_PASS=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$SERVER_PASS', safe=''))")
umount "$MOUNT_POINT" 2>/dev/null || true
diskutil unmount "$MOUNT_POINT" 2>/dev/null || true
mkdir -p "$MOUNT_POINT"
mount_smbfs "//$SERVER_DOMAIN;$SERVER_USER:$ENCODED_PASS@$SERVER_IP/C\$" "$MOUNT_POINT" || \
  MOUNT_POINT=$(mount | grep "$SERVER_IP" | awk -F' on ' '{print $2}' | awk '{print $1}')
echo "Using mount point: $MOUNT_POINT"

echo "==> Syncing files..."
rsync -av --delete "${DIST_PATH}/" "${MOUNT_POINT}/${REMOTE_PATH}/"

echo "==> Clearing hidden attributes..."
python3 - <<PYEOF
import winrm
s = winrm.Session('http://$SERVER_IP:5985/wsman', auth=('$SERVER_USER', '$SERVER_PASS'))
s.run_ps('attrib -h -s -r "C:\\inetpub\\$SITE_NAME\\*.*" /S /D')
print("Attributes cleared")
PYEOF

echo "==> Unmounting..."
diskutil unmount "$MOUNT_POINT" 2>/dev/null || true

echo "==> Restarting IIS App Pool..."
python3 - <<PYEOF
import winrm
s = winrm.Session('http://$SERVER_IP:5985/wsman', auth=('$SERVER_USER', '$SERVER_PASS'))
r = s.run_ps('Restart-WebAppPool -Name $SITE_NAME')
print(r.std_out.decode() or "Done")
if r.std_err: print("Error:", r.std_err.decode())
PYEOF

echo "==> Deploy complete! http://${SERVER_IP}:3000"
