import axios from 'axios';
import {useEffect, useState} from 'react';

const useFetchComments = (taskId) => {
    const [data, setData] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchComments = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`/tasks/${taskId}/comments`);
            const commentsResponse = response?.data?.body?.comments || [];
            setData(commentsResponse);
        } catch (error) {
            setError(error?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (taskId && taskId > 0) {
            fetchComments();
        }
    }, [taskId]);

    return {data, error, loading, refetch: fetchComments};
};

export default useFetchComments;