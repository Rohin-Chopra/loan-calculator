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

const cognitoConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
      userPoolClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID || '',
      loginWith: {
        oauth: {
          domain: import.meta.env.VITE_COGNITO_DOMAIN || '',
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
