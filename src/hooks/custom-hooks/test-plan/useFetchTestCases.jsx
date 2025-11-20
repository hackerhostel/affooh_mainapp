import axios from 'axios';
import {useEffect, useState} from 'react';

const useFetchTestCases = (projectId) => {
    const [data, setData] = useState({});
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchTestCases = async () => {
        setLoading(true)
        setError(false)
        try {
            const response = await axios.get(`/projects/${projectId}/test-cases`)
            const testCasesResponse = response?.data?.testCases;

            if (testCasesResponse.length) {
                setLoading(false)
                setData(testCasesResponse)
            }
        } catch (error) {
            setError(true)
            setLoading(false)
        }
    };

    useEffect(() => {
        if (projectId !== 0) {
            fetchTestCases()
        }
    }, [projectId]);

    return {data, error, loading, refetch: fetchTestCases};
};

export default useFetchTestCases;
