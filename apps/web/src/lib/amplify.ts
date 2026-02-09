import { Amplify } from 'aws-amplify';

const getRedirectUrls = () => {
  const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  return [
    appUrl,
    `${appUrl}/`,
    'http://localhost:5173',
    'http://localhost:5173/',
  ];
};

// Construct the full Cognito domain if only the short domain is provided
const getCognitoDomain = () => {
  const domain = import.meta.env.VITE_COGNITO_DOMAIN || '';
  const region = import.meta.env.VITE_AWS_REGION || 'ap-southeast-4';
  
  // If domain already contains .auth., it's already the full domain
  if (domain.includes('.auth.')) {
    return domain;
  }
  
  // Otherwise, construct the full domain
  if (domain) {
    return `${domain}.auth.${region}.amazoncognito.com`;
  }
  
  return '';
};

const cognitoConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
      userPoolClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID || '',
      loginWith: {
        oauth: {
          domain: getCognitoDomain(),
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: getRedirectUrls(),
          redirectSignOut: getRedirectUrls(),
          responseType: 'code' as const,
          providers: ['Google' as const],
        },
      },
    },
  },
};

Amplify.configure(cognitoConfig, {
  ssr: true,
});

export default Amplify;
