import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import httpCors from '@middy/http-cors';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '../utils/dynamodb';
import { generateDefaultName } from '../utils/helpers';
import type { CreateLoanRequest, SavedLoan } from '../types';
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

async function createLoanHandler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const body = event.body as unknown as CreateLoanRequest;
  const { loanInput, extraPaymentPerPeriod = 0, lumpSums = [], name } = body;

  if (!loanInput) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'loanInput is required' }),
    };
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const loanName = name || generateDefaultName(loanInput);

  const savedLoan: SavedLoan = {
    id,
    name: loanName,
    loanInput,
    extraPaymentPerPeriod,
    lumpSums,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: savedLoan,
    })
  );

  return {
    statusCode: 201,
    body: JSON.stringify(savedLoan),
  };
}

export const handler = middy(createLoanHandler)
  .use(httpJsonBodyParser())
  .use(httpCors())
  .use(httpErrorHandler());
