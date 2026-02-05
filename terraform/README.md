# Terraform Infrastructure for Loan Calculator

This directory contains Terraform configuration to deploy the loan calculator web application to AWS using S3, CloudFront, and Route53.

## Architecture

- **S3 Bucket**: Static website hosting for the React application
- **CloudFront**: CDN distribution with SSL/TLS termination
- **Route53**: DNS management for `loans.rohinchopra.com`
- **ACM**: SSL certificate for HTTPS (in us-east-1 for CloudFront)

## Prerequisites

1. AWS CLI configured with appropriate credentials
2. Terraform >= 1.0 installed
3. Route53 hosted zone for `rohinchopra.com` already exists
4. Domain `loans.rohinchopra.com` DNS validation access

## Setup

1. **Initialize Terraform**:
   ```bash
   cd terraform
   terraform init
   ```

2. **Review the plan**:
   ```bash
   terraform plan
   ```

3. **Apply the configuration**:
   ```bash
   terraform apply
   ```

   Note: The first apply will create the ACM certificate and Route53 validation records. You'll need to wait for certificate validation (usually a few minutes) before the CloudFront distribution can be fully created. If validation fails, run `terraform apply` again.

4. **Deploy your website**:
   After infrastructure is created, upload your built website files to the S3 bucket:
   ```bash
   # From the project root
   cd apps/web
   pnpm build
   aws s3 sync dist/ s3://$(terraform -chdir=../../terraform output -raw s3_bucket_name) --delete
   ```

   Or use the provided deployment script (see below).

## Variables

You can customize the deployment by creating a `terraform.tfvars` file:

```hcl
aws_region  = "ap-southeast-4"
domain_name = "loans.rohinchopra.com"
bucket_name = "loans-rohinchopra-com"
environment = "production"
```

## Outputs

After applying, you can view outputs with:
```bash
terraform output
```

Key outputs:
- `s3_bucket_name`: Name of the S3 bucket
- `cloudfront_distribution_id`: CloudFront distribution ID
- `website_url`: Full URL of the website
- `cloudfront_domain_name`: CloudFront domain name

## Deployment Script

Create a deployment script to automate building and uploading:

```bash
#!/bin/bash
set -e

echo "Building application..."
cd apps/web
pnpm build

echo "Getting S3 bucket name..."
BUCKET_NAME=$(cd ../../terraform && terraform output -raw s3_bucket_name)

echo "Uploading to S3..."
aws s3 sync dist/ s3://$BUCKET_NAME --delete

echo "Invalidating CloudFront cache..."
DISTRIBUTION_ID=$(cd ../../terraform && terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

echo "Deployment complete!"
```

## Important Notes

- The ACM certificate is created in `us-east-1` (required for CloudFront)
- The S3 bucket is created in `ap-southeast-4` (your specified region)
- CloudFront distribution can take 15-20 minutes to deploy
- Certificate validation typically takes 5-10 minutes
- After deployment, DNS propagation may take a few minutes to hours

## Troubleshooting

### Certificate validation fails
- Check Route53 records were created correctly
- Wait a few minutes and run `terraform apply` again
- Verify DNS propagation with `dig loans.rohinchopra.com`

### CloudFront not serving content
- Ensure S3 bucket policy allows CloudFront OAI access
- Check CloudFront distribution status in AWS Console
- Verify cache behaviors are configured correctly

### 404 errors on routes
- Ensure error pages are configured to serve `index.html`
- Check S3 bucket website configuration
- Verify CloudFront custom error responses

## Cleanup

To destroy all resources:
```bash
terraform destroy
```

**Warning**: This will delete all resources including the S3 bucket and its contents.
