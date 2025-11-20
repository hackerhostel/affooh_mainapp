import axios from 'axios';
import {useEffect, useState} from 'react';

const useFetchFlatTasks = (projectId) => {
    const [data, setData] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchEpics = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`/projects/${projectId}/epics`,);
            const epicsResponse = response?.data?.body || [];
            setData(epicsResponse);
        } catch (error) {
            setError(error?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId && projectId > 0) {
            fetchEpics();
        }
    }, [projectId]);

    return {data, error, loading};
};

export default useFetchFlatTasks;