# Creating a new Toto Microservice on AWS (ECS)
[Go back to the Main Page](../../README.md) <br>

This section goes through what it takes to create a new Toto Microservice and deploy it on AWS.

## 1. Toto AWS Architecture

Before continuing, make sure that you understand well how Toto runs on AWS. <br>
For that, check the AWS Toto Architecture resources: 
* [Toto AWS Architecture based on ECS]()

## 2. Creating and Deploying a new Microservice

Before reading this guide, make sure you have a good understanding of how Toto AWS Infrastructure is managed.
* Check the [Toto AWS Infrastructure and CI/CD Guide](./aws.md) first.

To deploy a Toto Service or App on GCP or AWS, you can start with **template projects**. <br>
Template Projects are working **empty microservices** that can be cloned and used as a base for the development of a new service.

The following templates are available: 

* [Python Microservice](https://github.com/nicolasances/toto-python-ms-template/). Follow this guide to create and deploy a new Python microservice. 
* [NodeJS Microservice](https://github.com/nicolasances/toto-node-template). Follow this guide to create and deploy a new NodeJS microservice. 