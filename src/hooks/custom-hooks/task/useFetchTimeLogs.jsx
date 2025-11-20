import axios from 'axios';
import {useEffect, useState} from 'react';

const useFetchTimeLogs = (taskId) => {
    const [data, setData] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchTimeLogs = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`/tasks/${taskId}/time-logs`);
            const timeLogResponse = response?.data?.timeLogs || [];
            setData(timeLogResponse);
        } catch (error) {
            setError(error?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (taskId && taskId > 0) {
            fetchTimeLogs();
        }
    }, [taskId]);

    return { data, error, loading, refetch: fetchTimeLogs };
};

export default useFetchTimeLogs;