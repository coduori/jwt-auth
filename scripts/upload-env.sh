#!/bin/bash
set -e
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source $PROJECT_ROOT/.env;

echo "🔐 Starting environment file encryption and upload..."
BUCKET_NAME="anchorage-secrets-registry-service"
ENV_FILE="${PROJECT_ROOT}/.env.production"
ENCRYPTED_FILE="${ENV_FILE}.gpg"
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
GCS_PATH="gs://${BUCKET_NAME}/.env.production.gpg"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: $ENV_FILE not found in current directory"
    exit 1
fi

echo "📦 Checking bucket: gs://$BUCKET_NAME"
if ! gsutil ls -b "gs://$BUCKET_NAME" >/dev/null 2>&1; then
    echo "   Bucket doesn't exist, creating..."
    
    if [ -n "$PROJECT_ID" ]; then
        gsutil mb -p "$PROJECT_ID" "gs://$BUCKET_NAME"
    else
        gsutil mb "gs://$BUCKET_NAME"
    fi
    
    echo "✅ Bucket created: gs://$BUCKET_NAME"

else
    echo "✅ Bucket already exists"
fi

echo "🔒 Encrypting..."

echo $ENV_ENCRYPTION_PASSPHRASE | gpg --batch --yes \
    --passphrase-fd 0 \
    --symmetric --cipher-algo AES256 \
    --output "$ENCRYPTED_FILE" \
    "$ENV_FILE"

echo "☁️  Uploading..."
gsutil cp "$ENCRYPTED_FILE" "$GCS_PATH"
gsutil stat "$GCS_PATH" | grep -E "(Creation time|Content-Length|MD5):" | head -3
echo "✅ Upload complete!"
rm -f "$ENCRYPTED_FILE"




