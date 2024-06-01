# Creating a new Toto Microservice in AWS
[Go back to the Main Page](../../../README.md) <br>

Before reading this guide, make sure you have a good understanding of how Toto AWS Infrastructure is managed. **[Check the Toto AWS Infrastructure and CI/CD Guide](./aws.md) first.**

In general, creating and deploying a new Microservice in Toto, requires the following steps: 
1. Create a Github Repo for the Microservice and the Terraform Workspaces.
2. Update Toto's AWS Terraform ([Core Infrastructure Flow, as described here](./aws.md#11-core-infrastructure-flow)) to create the needed Github Action secrets. 
3. Create the Microservices Terraform configuration files
4. Create the Microservices Github Actions Workflows
5. Push

## 1. Creating the Github Repository and Terraform Workspaces

First start by creating the `toto-ms-xxx` repository (it's a non-mandatory naming convention).

Once that is done, you need to create **one Terraform workspace for each environment**. <br>
You will thus have a `toto-ms-xxx-dev` workspace and a `toto-ms-xxx-prod` workspace in Terraform. <br>
These workspaces need basic Terraform Variables. These are:
* `aws_access_key`. The Access Key used to allow Terraform to perform operations on AWS. 
* `aws_secret_access_key`. The Secret Access Key related to the Access Key.

## 2. Updating Toto Core Infrastructure Terraform

Each Microservice in Toto needs to have a corresponding `repo-toto-ms-xxx` in the *terraform* configurations folder of the [`toto-aws-terra`](https://github.com/nicolasances/toto-aws-terra) repository. <br>

This file must **create all the Github Action Environment secrets** needed by the Microservice and **strictly related to the Core Infrastructure**. The following list is the typical list, but might be non exhaustive. To see the full updated list, visit the README of the [toto-aws-terra repository](https://github.com/nicolasances/toto-aws-terra).

* `ecs_subnet_1` and `ecs_subnet_2`: the IDs of the subnets used for hosting ECS Services.
* `ecs_security_group`: the Security Group used by the ECS Service.
* etc..

**Important Note**: These secrets must be stored **per Environment**, as an Github Environment Secret. <br>

Each Environment must be created by the Core Infrastructure Terraform flow. Naming is very important here.