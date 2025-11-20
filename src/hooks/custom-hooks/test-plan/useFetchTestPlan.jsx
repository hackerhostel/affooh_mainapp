import axios from 'axios';
import {useEffect, useState} from 'react';

const useFetchTestPlan = (testPlanId) => {
    const [data, setData] = useState({});
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchTestPlan = async () => {
            setLoading(true)
            setError(false)
            try {
                const response = await axios.get(`/test-plans/${testPlanId}`)
                const testPlanResponse = response?.data?.testPlan;

                if (testPlanResponse?.id) {
                    setLoading(false)
                    setData(testPlanResponse)
                }
            } catch (error) {
                setError(true)
                setLoading(false)
            }
        };

    useEffect(() => {
        if (testPlanId !== 0) {
            fetchTestPlan()
        }
    }, [testPlanId]);

    return {data, error, loading, refetch: fetchTestPlan};
};

export default useFetchTestPlan;
