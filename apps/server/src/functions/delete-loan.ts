import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import httpCors from '@middy/http-cors';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '../utils/dynamodb';
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

async function deleteLoanHandler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const id = event.pathParameters?.id;

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Loan ID is required' }),
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
