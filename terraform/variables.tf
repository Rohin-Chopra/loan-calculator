variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "ap-southeast-4"
}

variable "domain_name" {
  description = "Domain name for the website"
  type        = string
  default     = "loans.rohinchopra.com"
}

variable "bucket_name" {
  description = "Name of the S3 bucket (must be globally unique)"
  type        = string
  default     = "loans-rohinchopra-com"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "api_domain_name" {
  description = "Domain name for the API Gateway"
  type        = string
  default     = "api.loans.rohinchopra.com"
}

variable "google_client_id" {
  description = "Google OAuth Client ID"
  type        = string
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google OAuth Client Secret"
  type        = string
  sensitive   = true
}
