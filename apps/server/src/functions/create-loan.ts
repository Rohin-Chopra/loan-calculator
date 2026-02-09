import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import httpCors from '@middy/http-cors';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '../utils/dynamodb';
import { generateDefaultName } from '../utils/helpers';
import { requireAuth } from '../utils/auth';
import type { CreateLoanRequest, SavedLoan } from '../types';
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

async function createLoanHandler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const userId = requireAuth(event);
    
    // With httpJsonBodyParser, body is already parsed
    const body = event.body as unknown as CreateLoanRequest;
    
    if (!body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }
    
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
    userId,
    name: loanName,
    loanInput,
    extraPaymentPerPeriod,
    lumpSums,
    createdAt: now,
    updatedAt: now,
  };

    if (!TABLE_NAME) {
      throw new Error('TABLE_NAME environment variable is not set');
    }

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
  } catch (error) {
    console.error('Error creating loan:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return {
      statusCode: errorMessage.includes('Unauthorized') ? 401 : 500,
      body: JSON.stringify({ error: errorMessage }),
    };
  }
}

export const handler = middy(createLoanHandler)
  .use(httpJsonBodyParser())
  .use(httpCors())
  .use(httpErrorHandler());
