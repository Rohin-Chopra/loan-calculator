#!/bin/bash
set -e

echo "🚀 Starting full deployment..."

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR"

# Step 1: Build and package Lambda functions
echo ""
echo "📦 Step 1/4: Building and packaging Lambda functions..."
cd "$PROJECT_ROOT/apps/server"
pnpm package

# Step 2: Deploy Lambda functions via Terraform
echo ""
echo "☁️  Step 2/4: Deploying Lambda functions via Terraform..."
cd "$PROJECT_ROOT/terraform"
terraform apply -auto-approve -target=null_resource.lambda_build \
  -target=aws_lambda_function.create_loan \
  -target=aws_lambda_function.get_loan \
  -target=aws_lambda_function.list_loans \
  -target=aws_lambda_function.update_loan \
  -target=aws_lambda_function.delete_loan

# Step 3: Build frontend
echo ""
echo "🏗️  Step 3/4: Building frontend..."
cd "$PROJECT_ROOT/apps/web"
pnpm build

# Step 4: Deploy frontend to S3
echo ""
echo "📤 Step 4/4: Deploying frontend to S3..."
cd "$PROJECT_ROOT/terraform"
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

echo ""
echo "✅ Full deployment complete!"
echo "🌐 Website URL: https://loans.rohinchopra.com"
echo "🔗 API URL: https://api.loans.rohinchopra.com"
