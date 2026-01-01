# Welcome to Toto!

> This is a documentation repository. No code stored here ;) 

<<<<<<< HEAD
Toto is an Ecosystem of Apps that go from Personal Finances Management to Personal Trainer apps. <br> 
The Ecosystem also consists in a set of SDKs and frameworks to do anything, from exposing APIs, to building and orchestrating AI Agents. 

## Index
So where do we start? 
=======
## Toto Cross-cloud Architecture

Toto Microservices can be **deployed both on GCP and AWS**. <br>
Check out: 
* [Toto Microservice Template for Node](https://github.com/nicolasances/toto-node-template) - Follow this guide to create a Microservice in NodeJS and deploy it to AWS and GCP.

<br>

Since Toto runs across multiple Cloud Providers, some considerations and choices were made. These considerations are all documented in the following pages: 

* [Cross-Cloud Architecture Considerations & Choices](./docs/cross-cloud/considerations.md)

## Toto Services and Apps 

Service and App-specific documentation can be found in the repository of the Service or App.<br>
This include documentation of the processes and architecture.

## Specific guides

This section contains general guides that are not fitting any of the previous categories. 

* [Notes on NextJS](./docs/ui/webapp-nextjs.md). This page contains my notes on implementing an App using NextJS.
>>>>>>> fb10e0c0d88738c9d5b4e853c54416e495047316

* **Building Microservices in Toto** - The following resources are useful to start building Microservices following the (very opinionated) Toto approach: 
    * [Toto Microservice SDK](https://github.com/nicolasances/toto-microservice-sdk) - Repository of the Python and Node SDKs that can be used to build and deploy Microservices across different Clouds (e.g. AWS and GCP)
    * [Toto Node Microservice Template](https://github.com/nicolasances/toto-node-template) - Best way to quickly boostrap a Toto Microservice in **Node**
    * [Toto Python Microservice Template](https://github.com/nicolasances/toto-python-ms-template) - Best way to quickly boostrap a Toto Microservice in **Python**