import type { APIGatewayProxyEventV2 } from 'aws-lambda';

/**
 * Extracts the user ID from the Cognito JWT token in the Authorization header
 */
export function getUserIdFromEvent(event: APIGatewayProxyEventV2): string | null {
  // API Gateway with Cognito authorizer adds the claims to requestContext.authorizer.jwt.claims
  // Type assertion needed because the types don't include JWT authorizer claims
  const requestContext = event.requestContext as any;
  const claims = requestContext?.authorizer?.jwt?.claims;
  
  if (!claims) {
    return null;
  }

  // Cognito user ID is typically in 'sub' claim
  return claims.sub || claims['cognito:username'] || null;
}

/**
 * Middleware to extract and validate user ID from the event
 * Throws an error if user ID is not found
 */
export function requireAuth(event: APIGatewayProxyEventV2): string {
  const userId = getUserIdFromEvent(event);
  
  if (!userId) {
    throw new Error('Unauthorized: User ID not found in request');
  }
  
  return userId;
}
