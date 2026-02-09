import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import httpCors from '@middy/http-cors';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, TABLE_NAME } from '../utils/dynamodb';
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

async function listLoansHandler(
  _event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    })
  );

  // Sort by createdAt descending (newest first)
  const loans = (result.Items || []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    statusCode: 200,
    body: JSON.stringify(loans),
  };
}

export const handler = middy(listLoansHandler)
  .use(httpCors())
  .use(httpErrorHandler());
