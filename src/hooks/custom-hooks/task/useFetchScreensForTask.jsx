import axios from 'axios';
import {useEffect, useState} from 'react';

const useFetchScreensForTask = (screenId, projectId) => {
    const [data, setData] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchScreensForTask = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`screens/${screenId}?projectID=${projectId}`);
            const screenResponse = response.data.screen || {};
            setData(screenResponse);
        } catch (error) {
            setError(error?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (screenId && screenId > 0) {
            fetchScreensForTask();
        }
    }, [screenId]);

    return {data, error, loading};
};

export default useFetchScreensForTask;