terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "eu-central-1"
}

resource "aws_ecr_repository" "api" {
  name                 = "quayline"
  image_tag_mutability = "IMMUTABLE"
}
