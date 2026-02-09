terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.2"
    }
  }

  # Uncomment and configure if you want to use remote state
  # backend "s3" {
  #   bucket = "your-terraform-state-bucket"
  #   key    = "loan-calculator/terraform.tfstate"
  #   region = "ap-southeast-4"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "loan-calculator"
      ManagedBy   = "terraform"
      Environment = var.environment
    }
  }
}

# ACM Certificate for CloudFront (must be in us-east-1)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = "loan-calculator"
      ManagedBy   = "terraform"
      Environment = var.environment
    }
  }
}

# Data source to get the existing hosted zone for rohinchopra.com
data "aws_route53_zone" "main" {
  name         = "rohinchopra.com"
  private_zone = false
}

# S3 bucket for static website hosting
resource "aws_s3_bucket" "website" {
  bucket = var.bucket_name

  tags = {
    Name = "loan-calculator-website"
  }
}

# S3 bucket versioning
resource "aws_s3_bucket_versioning" "website" {
  bucket = aws_s3_bucket.website.id

  versioning_configuration {
    status = "Enabled"
  }
}

# S3 bucket public access block
resource "aws_s3_bucket_public_access_block" "website" {
  bucket = aws_s3_bucket.website.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 bucket website configuration
resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# CloudFront Origin Access Control (OAC) - newer recommended approach
resource "aws_cloudfront_origin_access_control" "website" {
  name                              = "${replace(var.domain_name, ".", "-")}-oac"
  description                       = "OAC for ${var.domain_name}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# S3 bucket policy for CloudFront OAC
resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.website.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.website.arn
          }
        }
      }
    ]
  })

  depends_on = [aws_cloudfront_distribution.website]
}

# CloudFront Cache Policy for default behavior
resource "aws_cloudfront_cache_policy" "default" {
  name        = "${replace(var.domain_name, ".", "-")}-default-cache-policy"
  comment     = "Default cache policy for ${var.domain_name}"
  default_ttl = 3600
  max_ttl     = 86400
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true

    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

# CloudFront Cache Policy for static assets
resource "aws_cloudfront_cache_policy" "static_assets" {
  name        = "${replace(var.domain_name, ".", "-")}-static-assets-cache-policy"
  comment     = "Cache policy for static assets with long TTL"
  default_ttl = 31536000 # 1 year
  max_ttl     = 31536000
  min_ttl     = 31536000

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true

    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }

    query_strings_config {
      query_string_behavior = "none"
    }
  }
}

# ACM Certificate for CloudFront (must be in us-east-1)
resource "aws_acm_certificate" "website" {
  provider = aws.us_east_1

  domain_name       = var.domain_name
  validation_method = "DNS"

  subject_alternative_names = []

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.domain_name}-certificate"
  }
}

# ACM Certificate Validation
resource "aws_acm_certificate_validation" "website" {
  provider = aws.us_east_1

  certificate_arn = aws_acm_certificate.website.arn

  validation_record_fqdns = [
    for record in aws_route53_record.cert_validation : record.fqdn
  ]

  timeouts {
    create = "5m"
  }
}

# Route53 records for certificate validation
resource "aws_route53_record" "cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.website.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.main.zone_id
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "website" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  comment             = "CloudFront distribution for ${var.domain_name}"

  aliases = [var.domain_name]

  origin {
    domain_name              = aws_s3_bucket.website.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.website.bucket}"
    origin_access_control_id = aws_cloudfront_origin_access_control.website.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.website.bucket}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    cache_policy_id = aws_cloudfront_cache_policy.default.id
  }

  # Cache behavior for static assets with longer TTL
  ordered_cache_behavior {
    path_pattern           = "/assets/*"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.website.bucket}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    cache_policy_id = aws_cloudfront_cache_policy.static_assets.id
  }

  # Error pages
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.website.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Name = "${var.domain_name}-distribution"
  }
}

# Route53 A record for the domain
resource "aws_route53_record" "website" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}

# Route53 AAAA record for IPv6
resource "aws_route53_record" "website_ipv6" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.website.domain_name
    zone_id                = aws_cloudfront_distribution.website.hosted_zone_id
    evaluate_target_health = false
  }
}

# ============================================================================
# Backend Infrastructure - DynamoDB, Lambda, API Gateway
# ============================================================================

# DynamoDB table for storing loans
resource "aws_dynamodb_table" "loans" {
  name         = "${var.environment}-loans"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Name = "${var.environment}-loans-table"
  }
}

# IAM role for Lambda functions
resource "aws_iam_role" "lambda_role" {
  name = "${var.environment}-loan-api-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# IAM policy for Lambda to access DynamoDB
resource "aws_iam_role_policy" "lambda_dynamodb_policy" {
  name = "${var.environment}-loan-api-lambda-dynamodb-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.loans.arn,
          "${aws_dynamodb_table.loans.arn}/index/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# Build Lambda packages from server workspace
resource "null_resource" "lambda_build" {
  triggers = {
    server_code = filemd5("${path.module}/../apps/server/package.json")
  }

  provisioner "local-exec" {
    command = <<-EOT
      cd ${path.module}/../apps/server
      pnpm install
      pnpm package
    EOT
  }
}

# Lambda function for creating loans
resource "aws_lambda_function" "create_loan" {
  filename         = "${path.module}/../apps/server/packages/create-loan.zip"
  function_name    = "${var.environment}-create-loan"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 10
  source_code_hash = filebase64sha256("${path.module}/../apps/server/packages/create-loan.zip")

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.loans.name
    }
  }

  depends_on = [null_resource.lambda_build]
}

# Lambda function for getting a loan by ID
resource "aws_lambda_function" "get_loan" {
  filename         = "${path.module}/../apps/server/packages/get-loan.zip"
  function_name    = "${var.environment}-get-loan"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 10
  source_code_hash = filebase64sha256("${path.module}/../apps/server/packages/get-loan.zip")

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.loans.name
    }
  }

  depends_on = [null_resource.lambda_build]
}

# Lambda function for listing loans
resource "aws_lambda_function" "list_loans" {
  filename         = "${path.module}/../apps/server/packages/list-loans.zip"
  function_name    = "${var.environment}-list-loans"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 10
  source_code_hash = filebase64sha256("${path.module}/../apps/server/packages/list-loans.zip")

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.loans.name
    }
  }

  depends_on = [null_resource.lambda_build]
}

# Lambda function for updating a loan
resource "aws_lambda_function" "update_loan" {
  filename         = "${path.module}/../apps/server/packages/update-loan.zip"
  function_name    = "${var.environment}-update-loan"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 10
  source_code_hash = filebase64sha256("${path.module}/../apps/server/packages/update-loan.zip")

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.loans.name
    }
  }

  depends_on = [null_resource.lambda_build]
}

# Lambda function for deleting a loan
resource "aws_lambda_function" "delete_loan" {
  filename         = "${path.module}/../apps/server/packages/delete-loan.zip"
  function_name    = "${var.environment}-delete-loan"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  timeout         = 10
  source_code_hash = filebase64sha256("${path.module}/../apps/server/packages/delete-loan.zip")

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.loans.name
    }
  }

  depends_on = [null_resource.lambda_build]
}

# API Gateway REST API
resource "aws_apigatewayv2_api" "loan_api" {
  name          = "${var.environment}-loan-api"
  protocol_type = "HTTP"
  description   = "API for loan calculator backend"

  cors_configuration {
    allow_origins = ["https://${var.domain_name}", "http://localhost:5173"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization"]
    max_age       = 300
  }
}

# API Gateway integration for create loan
resource "aws_apigatewayv2_integration" "create_loan" {
  api_id           = aws_apigatewayv2_api.loan_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.create_loan.invoke_arn
  integration_method = "POST"
}

# API Gateway integration for get loan
resource "aws_apigatewayv2_integration" "get_loan" {
  api_id           = aws_apigatewayv2_api.loan_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.get_loan.invoke_arn
  integration_method = "POST"
}

# API Gateway integration for list loans
resource "aws_apigatewayv2_integration" "list_loans" {
  api_id           = aws_apigatewayv2_api.loan_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.list_loans.invoke_arn
  integration_method = "POST"
}

# API Gateway integration for update loan
resource "aws_apigatewayv2_integration" "update_loan" {
  api_id           = aws_apigatewayv2_api.loan_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.update_loan.invoke_arn
  integration_method = "POST"
}

# API Gateway integration for delete loan
resource "aws_apigatewayv2_integration" "delete_loan" {
  api_id           = aws_apigatewayv2_api.loan_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.delete_loan.invoke_arn
  integration_method = "POST"
}

# API Gateway routes
resource "aws_apigatewayv2_route" "create_loan" {
  api_id    = aws_apigatewayv2_api.loan_api.id
  route_key = "POST /loans"
  target    = "integrations/${aws_apigatewayv2_integration.create_loan.id}"
}

resource "aws_apigatewayv2_route" "get_loan" {
  api_id    = aws_apigatewayv2_api.loan_api.id
  route_key = "GET /loans/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.get_loan.id}"
}

resource "aws_apigatewayv2_route" "list_loans" {
  api_id    = aws_apigatewayv2_api.loan_api.id
  route_key = "GET /loans"
  target    = "integrations/${aws_apigatewayv2_integration.list_loans.id}"
}

resource "aws_apigatewayv2_route" "update_loan" {
  api_id    = aws_apigatewayv2_api.loan_api.id
  route_key = "PUT /loans/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.update_loan.id}"
}

resource "aws_apigatewayv2_route" "delete_loan" {
  api_id    = aws_apigatewayv2_api.loan_api.id
  route_key = "DELETE /loans/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.delete_loan.id}"
}

# OPTIONS route for CORS preflight
resource "aws_apigatewayv2_route" "options" {
  api_id    = aws_apigatewayv2_api.loan_api.id
  route_key = "OPTIONS /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.create_loan.id}"
}

# API Gateway stage
resource "aws_apigatewayv2_stage" "loan_api" {
  api_id      = aws_apigatewayv2_api.loan_api.id
  name        = "$default"
  auto_deploy = true
}

# Lambda permissions for API Gateway
resource "aws_lambda_permission" "create_loan" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.create_loan.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.loan_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "get_loan" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_loan.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.loan_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "list_loans" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.list_loans.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.loan_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "update_loan" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.update_loan.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.loan_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "delete_loan" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.delete_loan.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.loan_api.execution_arn}/*/*"
}
