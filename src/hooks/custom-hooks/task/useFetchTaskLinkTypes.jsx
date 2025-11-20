import axios from 'axios';
import {useEffect, useState} from 'react';

const useFetchTaskLinkTypes = (projectId) => {
    const [data, setData] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchTaskLinkTypes = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`/tasks/link-types`);
            const linkTypeResponse = response?.data?.taskLinkTypes || [];
            setData(linkTypeResponse);
        } catch (error) {
            setError(error?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId && projectId > 0) {
            fetchTaskLinkTypes();
        }
    }, [projectId]);

    return {data, error, loading};
};

export default useFetchTaskLinkTypes;