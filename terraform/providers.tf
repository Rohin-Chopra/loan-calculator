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
