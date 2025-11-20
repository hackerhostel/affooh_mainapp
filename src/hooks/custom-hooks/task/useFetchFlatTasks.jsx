import axios from 'axios';
import {useEffect, useState} from 'react';

const useFetchFlatTasks = (projectId) => {
    const [data, setData] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchFlatTasks = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`/tasks/by-project/${projectId}`, {
                params: {
                    flatten: '1',
                    hideSubTasks: '0',
                },
            });

            const flatTasksResponse = response?.data?.body?.tasks || [];
            setData(flatTasksResponse);
        } catch (error) {
            setError(error?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId && projectId > 0) {
            fetchFlatTasks();
        }
    }, [projectId]);

    return { data, error, loading, refetch: fetchFlatTasks };
};

export default useFetchFlatTasks;