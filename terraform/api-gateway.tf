# ============================================================================
# API Gateway Infrastructure
# ============================================================================

# API Gateway REST API
resource "aws_apigatewayv2_api" "loan_api" {
  name          = "${var.environment}-loan-api"
  protocol_type = "HTTP"
  description   = "API for loan calculator backend"

  cors_configuration {
    allow_origins = ["https://${var.domain_name}", "https://${var.api_domain_name}", "http://localhost:5173"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization"]
    max_age       = 300
  }
}

# Cognito Authorizer
resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.loan_api.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "cognito-authorizer"

  jwt_configuration {
    audience = [aws_cognito_user_pool_client.web.id]
    issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.main.id}"
  }
}

# API Gateway integrations
resource "aws_apigatewayv2_integration" "create_loan" {
  api_id           = aws_apigatewayv2_api.loan_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.create_loan.invoke_arn
  integration_method = "POST"
}

resource "aws_apigatewayv2_integration" "get_loan" {
  api_id           = aws_apigatewayv2_api.loan_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.get_loan.invoke_arn
  integration_method = "POST"
}

resource "aws_apigatewayv2_integration" "list_loans" {
  api_id           = aws_apigatewayv2_api.loan_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.list_loans.invoke_arn
  integration_method = "POST"
}

resource "aws_apigatewayv2_integration" "update_loan" {
  api_id           = aws_apigatewayv2_api.loan_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.update_loan.invoke_arn
  integration_method = "POST"
}

resource "aws_apigatewayv2_integration" "delete_loan" {
  api_id           = aws_apigatewayv2_api.loan_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.delete_loan.invoke_arn
  integration_method = "POST"
}

# API Gateway routes
resource "aws_apigatewayv2_route" "create_loan" {
  api_id           = aws_apigatewayv2_api.loan_api.id
  route_key        = "POST /loans"
  target           = "integrations/${aws_apigatewayv2_integration.create_loan.id}"
  authorizer_id   = aws_apigatewayv2_authorizer.cognito.id
  authorization_type = "JWT"
}

resource "aws_apigatewayv2_route" "get_loan" {
  api_id           = aws_apigatewayv2_api.loan_api.id
  route_key        = "GET /loans/{id}"
  target           = "integrations/${aws_apigatewayv2_integration.get_loan.id}"
  authorizer_id   = aws_apigatewayv2_authorizer.cognito.id
  authorization_type = "JWT"
}

resource "aws_apigatewayv2_route" "list_loans" {
  api_id           = aws_apigatewayv2_api.loan_api.id
  route_key        = "GET /loans"
  target           = "integrations/${aws_apigatewayv2_integration.list_loans.id}"
  authorizer_id   = aws_apigatewayv2_authorizer.cognito.id
  authorization_type = "JWT"
}

resource "aws_apigatewayv2_route" "update_loan" {
  api_id           = aws_apigatewayv2_api.loan_api.id
  route_key        = "PUT /loans/{id}"
  target           = "integrations/${aws_apigatewayv2_integration.update_loan.id}"
  authorizer_id   = aws_apigatewayv2_authorizer.cognito.id
  authorization_type = "JWT"
}

resource "aws_apigatewayv2_route" "delete_loan" {
  api_id           = aws_apigatewayv2_api.loan_api.id
  route_key        = "DELETE /loans/{id}"
  target           = "integrations/${aws_apigatewayv2_integration.delete_loan.id}"
  authorizer_id   = aws_apigatewayv2_authorizer.cognito.id
  authorization_type = "JWT"
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
