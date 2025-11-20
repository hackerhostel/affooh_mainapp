export const BuildConstant = {
  REACT_APP_AUTH_REGION: import.meta.env.VITE_REACT_APP_AUTH_REGION,
  REACT_APP_AUTH_USER_POOL_ID: import.meta.env.VITE_REACT_APP_AUTH_USER_POOL_ID,
  REACT_APP_AUTH_USER_POOL_WEB_CLIENT_ID: import.meta.env
    .VITE_REACT_APP_AUTH_USER_POOL_WEB_CLIENT_ID,
  REACT_APP_COGNITO_IDENTITY_POOL_ID: import.meta.env
    .VITE_REACT_APP_COGNITO_IDENTITY_POOL_ID,
  REACT_APP_APPSYNC_GRAPHQL_ENDPOINT: import.meta.env
    .VITE_REACT_APP_APPSYNC_GRAPHQL_ENDPOINT,
  REACT_APP_APPSYNC_REGION: import.meta.env.VITE_REACT_APP_APPSYNC_REGION,
  REACT_APP_APPSYNC_AUTHENTICATION_TYPE: import.meta.env
    .VITE_REACT_APP_APPSYNC_AUTHENTICATION_TYPE,
  REACT_APP_S3_BUCKET: import.meta.env.VITE_REACT_APP_S3_BUCKET,
  REACT_APP_S3_BUCKET_REGION: import.meta.env.VITE_REACT_APP_S3_BUCKET_REGION,
  REACT_APP_X_API_KEY: import.meta.env.VITE_REACT_APP_X_API_KEY,
  REACT_APP_API_PROTOCOL: import.meta.env.VITE_REACT_APP_API_PROTOCOL,
  REACT_APP_API_HOST: import.meta.env.VITE_REACT_APP_API_HOST,
};

export function getBuildConstant(constName) {
  if (!BuildConstant[constName]) {
    throw Error(`Invalid configuration the constant '${constName}' is not set`);
  }
  return BuildConstant[constName];
}
