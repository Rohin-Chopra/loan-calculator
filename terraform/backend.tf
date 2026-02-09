# ============================================================================
# Backend Infrastructure - DynamoDB, IAM, Lambda
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

  attribute {
    name = "userId"
    type = "S"
  }

  global_secondary_index {
    name            = "userId-index"
    hash_key        = "userId"
    projection_type = "ALL"
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
