import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpErrorHandler from '@middy/http-error-handler';
import httpCors from '@middy/http-cors';
import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '../utils/dynamodb';
import type { UpdateLoanRequest } from '../types';
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

async function updateLoanHandler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const id = event.pathParameters?.id;
  const body = event.body as unknown as UpdateLoanRequest;
  const { name, loanInput, extraPaymentPerPeriod, lumpSums } = body;

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Loan ID is required' }),
    };
  }

  // Check if loan exists
  const getResult = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    })
  );

  if (!getResult.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Loan not found' }),
    };
  }

  // Build update expression
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, unknown> = {};

  if (name !== undefined) {
    updateExpressions.push('#name = :name');
    expressionAttributeNames['#name'] = 'name';
    expressionAttributeValues[':name'] = name;
  }

  if (loanInput !== undefined) {
    updateExpressions.push('loanInput = :loanInput');
    expressionAttributeValues[':loanInput'] = loanInput;
  }

  if (extraPaymentPerPeriod !== undefined) {
    updateExpressions.push('extraPaymentPerPeriod = :extraPaymentPerPeriod');
    expressionAttributeValues[':extraPaymentPerPeriod'] = extraPaymentPerPeriod;
  }

  if (lumpSums !== undefined) {
    updateExpressions.push('lumpSums = :lumpSums');
    expressionAttributeValues[':lumpSums'] = lumpSums;
  }

  if (updateExpressions.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No fields to update' }),
    };
  }

  // Always update updatedAt
  updateExpressions.push('updatedAt = :updatedAt');
  expressionAttributeValues[':updatedAt'] = new Date().toISOString();

  const updateResult = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames:
        Object.keys(expressionAttributeNames).length > 0
          ? expressionAttributeNames
          : undefined,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    })
  );

  return {
    statusCode: 200,
    body: JSON.stringify(updateResult.Attributes),
  };
}

export const handler = middy(updateLoanHandler)
  .use(httpJsonBodyParser())
  .use(httpCors())
  .use(httpErrorHandler());
