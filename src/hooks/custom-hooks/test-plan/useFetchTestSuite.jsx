import axios from "axios";
import { useEffect, useState } from "react";

const useFetchTestSuite = (testSuiteID) => {
  const [data, setData] = useState({});
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchTestSuite = async () => {
    if (testSuiteID === 0) return; // Prevent fetching if testSuiteID is 0

    setLoading(true);
    setError(false);
    try {
      const response = await axios.get(
        `/test-plans/test-suites/${testSuiteID}`
      );
      const testSuiteResponse = response?.data?.testSuite;

      if (testSuiteResponse?.testSuite?.id) {
        setData(testSuiteResponse);
        setLoading(false);
      } else {
        setData({});
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching test suite:", error);
      setError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (testSuiteID !== 0) {
      fetchTestSuite();
    }
  }, [testSuiteID]);

  return { data, error, loading, fetchTestSuite }; // Return fetchTestSuite function
};

export default useFetchTestSuite;
