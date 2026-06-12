# amplify

An **AWS Amplify backend** (`serverlessapp`) for a serverless product-catalog
application — an AppSync GraphQL API backed by a relational (RDS) database,
Cognito authentication with social login, supporting Lambda functions, and S3
storage.

> Archival / personal project (~2024). This repo contains the Amplify
> **backend definition** only (the `amplify/` environment), not the front-end
> app it served.

## Architecture

| Amplify category | Resource | What it does |
|------------------|----------|--------------|
| **api** | `serverlessapp` (AppSync GraphQL) | GraphQL API with VTL resolvers mapping to an **Aurora/RDS** datasource (`DemoDatabase`). Models: `Users` and `Products`. |
| **auth** | Cognito user pool | Sign-up/sign-in with **Google** and **Facebook** federation; a **PostConfirmation** Lambda trigger runs after a user confirms. |
| **function** | `…PostConfirmation` | Cognito post-confirmation trigger (provisions the user). |
| **function** | `serverlessappaddproduct` | Lambda that creates products and sends email via **SES**. |
| **storage** | `demoapps3` (S3) | Object storage for uploaded assets (referenced by `fileKey`). |

### GraphQL schema (`amplify/backend/api/serverlessapp/schema.graphql`)

- **Users** — `id`, `name`, `email`.
- **Products** — dimensional records (`left*`/`right*` width/length/height,
  logos), `fileKey`, `ownerId`, timestamps.
- Queries include `getUsers`/`listUserss`, `getProducts`/`listProductss`, and
  `listProductsByUser(ownerId)`; mutations create/update/delete each model;
  subscriptions fire on create.

## Working with this backend

Requires the [Amplify CLI](https://docs.amplify.aws/cli/) and an AWS account.

```bash
npm install -g @aws-amplify/cli
amplify pull --appId <APP_ID> --envName <ENV>   # hydrate into a front-end app
amplify status                                   # see resources
amplify push                                     # deploy backend changes
```

> The RDS cluster identifier, database name, Secrets Manager ARN, and the
> Google/Facebook app IDs are supplied as Amplify parameters
> (`amplify/backend/backend-config.json`) — set them for your own account before
> deploying. The original CloudFormation references account-specific resources.
