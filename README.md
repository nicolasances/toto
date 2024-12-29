# Welcome to Toto!
This repo mostly serves as a documentation repo, providing guides for Toto and the description of some of the core (or more complex) processes.

## 1. Technical Guides
### 1.1. Infrastructure and CI/CD 
Toto's infrastructure is cloud-based and is a mix of AWS and GCP clouds. <br>
All infrastructure (or at least as much as possible) is managed through *Terraform*. <br>
The following guides go through the basics workings of how infrastructure and services are managed and deployed.

* [AWS Toto Environment](docs/infra-cicd/aws/aws.md). Check how Toto AWS Infrastructure is managed and how Toto microservices are deployed on AWS.

### 1.2. Creating a new Microservice
The following guides explain how to create a new Microservice in Toto.

* [Creating a new Microservice on AWS ECS](./docs/microservices/new-ms-aws-ecs.md)
