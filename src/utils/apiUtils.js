import axios from 'axios';
import {fetchAuthSession} from "aws-amplify/auth";

export const setupAuthorizationHeader = () => {
  axios.interceptors.request.use(
    async (config) => {
      try {
        if (
          !(config.url === '/user' && config.method === 'post') &&
          !(config.url && config.url.includes('amazonaws.com')) &&
          !(config.url && config.url.includes('geolocation-db.com'))
        ) {
          config.headers.Authorization = (await fetchAuthSession())?.tokens?.idToken?.toString();
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(error);
      }
      return config;
    },
    async (error) => ({ error }),
  );
};

export default {};
