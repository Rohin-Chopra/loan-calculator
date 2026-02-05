#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "📦 Building application..."
cd "$PROJECT_ROOT/apps/web"
pnpm build

if [ ! -d "dist" ]; then
  echo "❌ Build failed: dist directory not found"
  exit 1
fi

echo "📋 Getting infrastructure details..."
cd "$SCRIPT_DIR"
BUCKET_NAME=$(terraform output -raw s3_bucket_name 2>/dev/null || echo "")
DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "")

if [ -z "$BUCKET_NAME" ]; then
  echo "❌ Error: Could not get S3 bucket name. Make sure Terraform has been applied."
  exit 1
fi

echo "☁️  Uploading to S3 bucket: $BUCKET_NAME"
cd "$PROJECT_ROOT/apps/web"
aws s3 sync dist/ "s3://$BUCKET_NAME" --delete --exact-timestamps

if [ -n "$DISTRIBUTION_ID" ]; then
  echo "🔄 Invalidating CloudFront cache..."
  aws cloudfront create-invalidation \
    --distribution-id "$DISTRIBUTION_ID" \
    --paths "/*" \
    --output json > /dev/null
  
  echo "✅ CloudFront cache invalidation initiated"
else
  echo "⚠️  Warning: Could not get CloudFront distribution ID. Skipping cache invalidation."
fi

echo "✅ Deployment complete!"
echo "🌐 Website URL: https://loans.rohinchopra.com"
