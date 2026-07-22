terraform {
  required_version = ">= 1.10.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  cloud {
    organization = "il2dottore"

    workspaces {
      name = "loadservice-infra"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

locals {
  repositories = toset([
    "loadservice-common",
    "loadservice-attack",
    "loadservice-payment",
    "loadservice-attack-node-router",
    "loadservice-api-gateway",
  ])
}

resource "aws_ecr_repository" "loadservice" {
  for_each             = local.repositories
  name                 = each.value
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }
}

resource "aws_ecr_lifecycle_policy" "loadservice" {
  for_each   = aws_ecr_repository.loadservice
  repository = each.value.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep the newest 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}

variable "aws_region" {
  description = "AWS region containing the ECR repositories"
  type        = string
}

output "repository_urls" {
  value = { for name, repo in aws_ecr_repository.loadservice : name => repo.repository_url }
}
