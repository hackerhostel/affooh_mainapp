import axios from 'axios';
import {useEffect, useState} from 'react';

const useFetchTestExecution = (testSuiteID, testCycleID) => {
    const [data, setData] = useState({});
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchTestExecution = async (skipLoading = false) => {
        if (!skipLoading) {
            setLoading(true);
        }
        setError(false)
        try {
            const response = await axios.get(`/test-plans/test-suites/${testSuiteID}/test-cycle/${testCycleID}`)
            const testExecutionResponse = response?.data?.testExecutionData;

            if (testExecutionResponse.length) {
                setLoading(false)
                setData(testExecutionResponse)
            }
        } catch (error) {
            setError(true)
        } finally {
            if (!skipLoading) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (testCycleID !== 0) {
            fetchTestExecution()
        }
    }, [testCycleID]);

    return {data, error, loading, refetch: fetchTestExecution};
};

export default useFetchTestExecution;
