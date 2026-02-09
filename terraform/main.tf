# This file is intentionally minimal.
# The infrastructure is organized into separate files:
# - providers.tf: Terraform and provider configuration
# - data.tf: Data sources
# - frontend.tf: S3 and CloudFront resources
# - certificates.tf: ACM certificates
# - backend.tf: DynamoDB, IAM, and Lambda functions
# - api-gateway.tf: API Gateway API, integrations, routes, and permissions
# - api-domain.tf: API Gateway custom domain
# - route53.tf: Route53 DNS records
# - variables.tf: Input variables
# - outputs.tf: Output values
