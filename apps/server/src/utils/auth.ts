import type { APIGatewayProxyEventV2 } from 'aws-lambda';

/**
 * Extracts the user ID from the Cognito JWT token in the Authorization header
 */
export function getUserIdFromEvent(event: APIGatewayProxyEventV2): string | null {
  try {
    // API Gateway v2 HTTP API with JWT authorizer puts claims in requestContext.authorizer.claims
    // (not requestContext.authorizer.jwt.claims like REST API)
    const requestContext = event.requestContext as any;
    const claims = requestContext?.authorizer?.claims;
    
    if (!claims) {
      return null;
    }

    // Cognito user ID is typically in 'sub' claim
    const userId = claims.sub || claims['cognito:username'] || claims.username || null;
    
    if (!userId) {
      console.warn('No user ID found in claims. Available claim keys:', Object.keys(claims));
    }
    
    return userId;
  } catch (error) {
    console.error('Error extracting user ID:', error);
    return null;
  }
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
