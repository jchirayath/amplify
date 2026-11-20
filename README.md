# amplify

A full-stack **eyeglass prescription (Rx) demo** on AWS Amplify: a React single-page
app plus the Amplify backend it runs on — an AppSync GraphQL API mapped to a
relational (Aurora/RDS) datasource, Cognito authentication with social login,
supporting Lambda functions, and S3 storage.

> Archival / personal project (~2024). Both halves are here: the front end in `src/`
> and the Amplify environment in `amplify/`. It is a demo, not a product — see
> [Before reusing this](#before-reusing-this).

> **New: [`poc/`](poc/README.md)** is a front-end-only UI proof of concept, rebuilt for
> funding pitches on Vite + React + Tailwind with sample data and a corrected clinical
> model (SPH added, OD/OS fixed, ADD as a power). It doesn't depend on the Amplify backend.
> `cd poc && npm install && npm run dev`.

## What it does

An optician signs in, records a prescription for a patient's left and right lenses
(ADD, AXIS, CYL, PRISM), optionally attaches a file, and sees the saved records on a
dashboard. Creating a record writes to RDS, uploads any attachment to S3 and sends
an email via SES.

## Front end (`src/`)

React 18 + TypeScript, Material UI 5, created with Create React App.

| Path | What it is |
|---|---|
| `src/routes.ts` | Three routes: `/signin`, `/signup`, and `/*` → the dashboard layout. |
| `src/pages/SignIn.tsx`, `SignUp.tsx` | Cognito email sign-up/sign-in plus the Google and Facebook buttons. |
| `src/pages/Dashboard.tsx` | Landing view inside the authenticated layout, with a `recharts` chart. |
| `src/pages/AddProduct.tsx` | The Rx entry form — per-eye values, validated with Formik + Yup. |
| `src/components/ProductsTable.tsx` | Saved records for the signed-in user (`listProductsByUser`). |
| `src/components/FileUpload.tsx` | Uploads an attachment to S3 and keeps its `fileKey`. |
| `src/contexts/AuthContext.tsx`, `src/hooks/useAuth.ts` | Session state over the Amplify Auth APIs. |
| `src/theme.ts` | The MUI theme. |

```bash
yarn install
amplify pull --appId <APP_ID> --envName <ENV>   # writes src/aws-exports.js (gitignored)
yarn start                                       # http://localhost:3000
```

`src/index.tsx` imports `./aws-exports`, which is **not** in the repo because it holds
account-specific identifiers. Without `amplify pull` (or a hand-written copy) the app
will not compile.

## Backend (`amplify/`)

| Amplify category | Resource | What it does |
|------------------|----------|--------------|
| **api** | `serverlessapp` (AppSync GraphQL) | GraphQL API with hand-written VTL resolvers mapping to an **Aurora/RDS** datasource (`DemoDatabase`) rather than the default DynamoDB. Models: `Users` and `Products`. |
| **auth** | Cognito user pool | Sign-up/sign-in with **Google** and **Facebook** federation; a **PostConfirmation** Lambda trigger runs after a user confirms. |
| **function** | `…PostConfirmation` | Cognito post-confirmation trigger — provisions the user row, so no first-login special case is needed. |
| **function** | `serverlessappaddproduct` | Lambda that creates products and sends email via **SES**. |
| **storage** | `demoapps3` (S3) | Object storage for uploaded attachments (referenced by `fileKey`). |

Because the datasource is relational, the resolvers in
`amplify/backend/api/serverlessapp/resolvers/` are SQL in VTL — one request/response
pair per operation — instead of the generated DynamoDB resolvers Amplify writes by
default.

### GraphQL schema (`amplify/backend/api/serverlessapp/schema.graphql`)

- **Users** — `id`, `name`, `email`.
- **Products** — one row per prescription: `leftWidth`/`leftLength`/`leftHeight`/`leftLogo`
  and the matching `right*` fields, plus `fileKey`, `ownerId`, `email` and timestamps.
- Queries: `getUsers`/`listUserss`, `getProducts`/`listProductss`, `listProductsByUser(ownerId)`.
  Mutations create/update/delete each model. Subscriptions fire on create.

Note the field names are geometric (`Width`, `Length`, `Height`, `Logo`) while the UI
labels them as optical values (ADD, AXIS, CYL, PRISM). The schema was written generically
and the meaning lives in the form, not in the API contract — worth renaming before
anyone builds on it.

```bash
npm install -g @aws-amplify/cli
amplify status        # see resources
amplify push          # deploy backend changes
```

## Before reusing this

This is demo-grade, and a few things must change before it holds anyone's real data —
prescriptions are health data:

- **The schema declares `globalAuthRule: { allow: public }`.** That permits unauthenticated
  API-key access to the whole API. Tighten it to the Cognito user pool, and scope `Products`
  to its `ownerId`, before any real record exists.
- **Account-specific values are baked in.** `src/index.tsx` hard-codes the production OAuth
  redirect (`https://master.d29thsukvcvws1.amplifyapp.com/`); the RDS cluster identifier,
  database name, Secrets Manager ARN and the Google/Facebook app IDs come from Amplify
  parameters in `amplify/backend/backend-config.json`. All need to point at your own account.
- **Dependencies are pinned loosely.** `yarn.lock` is committed, so a `yarn install` here is
  reproducible, but the ranges in `package.json` are caret ranges — refresh them deliberately
  rather than letting a major version arrive unannounced.

## Licence

MIT — see [LICENSE](LICENSE). Copyright (c) 2026 Jacob Chirayath.
