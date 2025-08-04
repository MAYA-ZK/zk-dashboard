# ZK Dashboard

Not maintained anymore. This project was used to visualize the data from the ZK ecosystem. Sunsetting in August 2025.

## Table of contents

- [ZK Dashboard](#zk-dashboard)
  - [Table of contents](#table-of-contents)
  - [Dashboard `./dashboard`](#dashboard-dashboard)
    - [Getting started](#getting-started)
    - [Technologies used](#technologies-used)
    - [Deployment](#deployment)
  - [Synchronizer `./synchronizer`](#synchronizer-synchronizer)
  - [Infra `./infra`](#infra-infra)
  - [Common `./common`](#common-common)

## Dashboard `./dashboard`

ZK Dashboard visualize the data from the ZK ecosystem.

### Getting started

To start the project locally, install the dependencies and run the development server.

In the root of the project, install the dependencies:

```bash
nvm use # Use the correct node version
npm install
```

Create a `.env` file based on the `.env.example` file and fill in the required values (`./dashboard/.env`):

```bash
cp .env.example .env`
```

Run the development server (`./dashboard`):

```bash
npm run dev
```

### Technologies used

- [NPM Workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces): Simple monorepo management
- [Next.js](https://nextjs.org/): React framework (App router)
- [NextUi](https://nextui.org/): UI library
- [Drizzle ORM](https://orm.drizzle.team/): headless TypeScript ORM
- [Postgres](https://www.postgresql.org/): Database

### Deployment

The dashboard is deployed to Vercel using the [Vercel for GitHub](https://vercel.com/docs/git) integration.

## Synchronizer `./synchronizer`

Script that synchronizes data from different sources to the database

## Infra `./infra`

Pulumi project that deploys the infrastructure

## Common `./common`

Common code used by the different workspaces
