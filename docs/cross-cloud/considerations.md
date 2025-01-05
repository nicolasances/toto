# Considerations for the integration between Cloud Providers
Toto is using a mix of Cloud Providers. <br>
This page explains **the core design choices** that have been made to make this work. 

## General Considerations
In general the following key principles have been used: 
1. **Data stays on GCP**. <br>
All the **Single Source of Truth** data is and will remain on GCP. <br>
This includes data on GCS Buckets and MongoDB data. <br>
The following **exceptions** apply: 
    * **Dev data**. A Dev MongoDB has been setup on an AWS VM. All dev microservices should use that DB. 
    * **Analytical data**. Analytical data can be replicated to AWS, if needed.


## Toto AWS Service accessing GCP
As explained in [General Considerations](#general-considerations), **data is on GCP**. <br>
That means that AWS Services will need to access GCP. <br>

For that reason, AWS Services need a **GCP Service Account**. The following choices have been made and implemented: 
* An **IAM Role** called `AWSTotoService` is created on all environments on GCP. This role has the necessary permissions to access the required services on GCP. For now these permissions are GCS-related. *This role has been manually created* (it's not provisioned through Terraform).
* A **Service Account** for a **generic** AWS Toto Service is created in all GCP environments. It is called `toto-aws-service@<project>.iam.gserviceaccount.com`. 
* The `AWSTotoService` role is assgined to that Service Account.
* A **JSON key file** is exported and manually registered in [Terraform](https://app.terraform.io) in one of the `toto-aws-terra` workspaces, in a variable called `gcp_service_account_key`. The variable must **contain** the **content** of the JSON key file.
* The Terraform plan injects the service account key as a file in the Docker container. It's **mounted** in the container's volume and the `GOOGLE_APPLICATION_CREDENTIALS` env var is set accordingly (in the Github Actions file of the Microservice).

*This is **not** the most secure option, but it's much less complicated than setting up Identity Federation between the AWS and GCP accounts.*