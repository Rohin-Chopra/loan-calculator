# ============================================================================
# Cognito User Pool for Authentication
# ============================================================================

# Cognito User Pool
resource "aws_cognito_user_pool" "main" {
  name = "${var.environment}-loan-calculator-users"

  # Password policy
  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_uppercase = true
    require_numbers   = true
    require_symbols   = true
  }

  # User pool attributes
  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
    mutable             = true
  }

  schema {
    name                = "name"
    attribute_data_type = "String"
    required            = false
    mutable             = true
  }

  # Auto-verify email
  auto_verified_attributes = ["email"]

  # Account recovery
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  tags = {
    Name = "${var.environment}-loan-calculator-user-pool"
  }
}

# Google Identity Provider
resource "aws_cognito_identity_provider" "google" {
  user_pool_id  = aws_cognito_user_pool.main.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    authorize_scopes = "openid email profile"
    client_id        = var.google_client_id
    client_secret    = var.google_client_secret
  }

  attribute_mapping = {
    email      = "email"
    username   = "sub"
    given_name = "given_name"
    family_name = "family_name"
    name       = "name"
  }
}

# Cognito User Pool Client (for web app)
resource "aws_cognito_user_pool_client" "web" {
  name         = "${var.environment}-web-client"
  user_pool_id = aws_cognito_user_pool.main.id

  generate_secret = false

  # OAuth settings
  allowed_oauth_flows                  = ["code", "implicit"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]
  allowed_oauth_flows_user_pool_client = true

  # Callback URLs
  callback_urls = [
    "https://${var.domain_name}",
    "https://${var.domain_name}/",
    "http://localhost:5173",
    "http://localhost:5173/",
  ]

  # Logout URLs
  logout_urls = [
    "https://${var.domain_name}",
    "https://${var.domain_name}/",
    "http://localhost:5173",
    "http://localhost:5173/",
  ]

  # Supported identity providers
  supported_identity_providers = ["Google", "COGNITO"]

  # Token validity (values are in minutes, but Terraform expects duration strings)
  # Note: These are optional - removing them to use defaults
  # access_token_validity  = "60m"   # 1 hour
  # id_token_validity      = "60m"   # 1 hour  
  # refresh_token_validity = "43200m" # 30 days

  # Prevent user existence errors
  prevent_user_existence_errors = "ENABLED"
}

# Cognito User Pool Domain (for hosted UI)
resource "aws_cognito_user_pool_domain" "main" {
  domain       = "${var.environment}-loans-auth"
  user_pool_id = aws_cognito_user_pool.main.id
}
