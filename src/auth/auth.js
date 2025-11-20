import { getBuildConstant } from '../constants/build-constants';

export const AwsConfigAuth = {
  aws_project_region: getBuildConstant('REACT_APP_AUTH_REGION'),
  aws_cognito_region: getBuildConstant('REACT_APP_AUTH_REGION'),
  aws_user_pools_id: getBuildConstant('REACT_APP_AUTH_USER_POOL_ID'),
  aws_cognito_identity_pool_id: getBuildConstant(
    'REACT_APP_COGNITO_IDENTITY_POOL_ID',
  ),
  aws_user_pools_web_client_id: getBuildConstant(
    'REACT_APP_AUTH_USER_POOL_WEB_CLIENT_ID',
  ),
  aws_user_files_s3_bucket: getBuildConstant('REACT_APP_S3_BUCKET'),
  aws_user_files_s3_bucket_region: getBuildConstant(
    'REACT_APP_S3_BUCKET_REGION',
  ),
  // allow unauthenticated access to cognito users using identity pool config
  Storage: {
    bucket: getBuildConstant('REACT_APP_S3_BUCKET'),
    region: getBuildConstant('REACT_APP_S3_BUCKET_REGION'),
  },
};
