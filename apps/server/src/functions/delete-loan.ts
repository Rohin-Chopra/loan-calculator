import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import httpCors from '@middy/http-cors';
import { GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '../utils/dynamodb';
import { requireAuth } from '../utils/auth';
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

async function deleteLoanHandler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const userId = requireAuth(event);
  const id = event.pathParameters?.id;

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Loan ID is required' }),
    };
  }

  // Check if loan exists and verify ownership
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

  if (getResult.Item.userId !== userId) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Forbidden: You do not have access to this loan' }),
    };
  }

  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
    })
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, id }),
  };
}

export const handler = middy(deleteLoanHandler)
  .use(httpCors())
  .use(httpErrorHandler());
