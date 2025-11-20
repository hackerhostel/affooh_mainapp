import axios from 'axios';
import {useEffect, useState} from 'react';

const useFetchTask = (code) => {
    const [data, setData] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchTask = async (skipLoading = false) => {
        if (!skipLoading) {
            setLoading(true);
        }
        setError('');
        try {
            const response = await axios.get(`tasks/by-code/${code}`);
            const taskResponse = response?.data?.body?.task || {};
            setData(taskResponse);
        } catch (error) {
            setError(error?.message || 'Something went wrong');
        } finally {
            if (!skipLoading) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (code && code !== '') {
            fetchTask();
        }
    }, [code]);

    return {data, error, loading, refetch: fetchTask};
};

export default useFetchTask;