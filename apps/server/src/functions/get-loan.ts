import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import httpCors from '@middy/http-cors';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '../utils/dynamodb';
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

async function getLoanHandler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const id = event.pathParameters?.id;

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Loan ID is required' }),
    };
  }

  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    })
  );

  if (!result.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Loan not found' }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result.Item),
  };
}

export const handler = middy(getLoanHandler)
  .use(httpCors())
  .use(httpErrorHandler());
