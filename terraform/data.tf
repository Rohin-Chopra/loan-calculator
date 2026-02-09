# Data source to get the existing hosted zone for rohinchopra.com
data "aws_route53_zone" "main" {
  name         = "rohinchopra.com"
  private_zone = false
}
