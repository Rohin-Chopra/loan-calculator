# Server - Lambda Functions

This workspace contains the AWS Lambda functions for the loan calculator API, written in TypeScript with Middy middleware.

## Structure

```
src/
  functions/        # Lambda function handlers
  utils/           # Shared utilities
  types.ts         # TypeScript type definitions
```

## Functions

- `create-loan` - Creates a new loan
- `get-loan` - Retrieves a loan by ID
- `list-loans` - Lists all loans
- `update-loan` - Updates an existing loan
- `delete-loan` - Deletes a loan

## Development

### Install Dependencies

```bash
pnpm install
```

### Build

```bash
pnpm build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Package for Deployment

```bash
pnpm package
```

This will:
1. Build the TypeScript code
2. Package each function with its dependencies into zip files
3. Output zip files to `packages/` directory

## Deployment

The Lambda functions are deployed via Terraform. Terraform will automatically:
1. Build and package the functions
2. Upload them to AWS Lambda
3. Configure API Gateway routes

To deploy:

```bash
cd ../../terraform
terraform apply
```

## Environment Variables

Each Lambda function receives:
- `TABLE_NAME` - The DynamoDB table name (set by Terraform)

## Technologies

- **TypeScript** - Type-safe Lambda functions
- **Middy** - Middleware framework for Lambda
  - `@middy/http-json-body-parser` - Parse JSON request bodies
  - `@middy/http-cors` - Handle CORS headers
  - `@middy/http-error-handler` - Standardized error handling
- **AWS SDK v3** - DynamoDB client
