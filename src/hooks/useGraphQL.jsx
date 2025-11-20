import { useState } from 'react';
import {generateClient} from "aws-amplify/api";
import {fetchAuthSession} from "aws-amplify/auth";

// Custom hook to perform GraphQL operations
const useGraphQL = () => {
  const client = generateClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const makeRequest = async (query, variables = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await client.graphql({
        query,
        variables,
        authToken: (await fetchAuthSession())?.tokens?.idToken,
      });
      setLoading(false);
      return result;
    } catch (err) {
      setError(err);
      setLoading(false);
      return null;
    }
  };

  return { makeRequest, loading, error };
};

export default useGraphQL;
