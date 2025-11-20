import axios from 'axios';
import {useEffect, useState} from 'react';

const useFetchSprint = (sprintId) => {
    const [data, setData] = useState({});
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchSprint = async () => {
        setLoading(true)
        setError(false)
        try {
            const response = await axios.get(`/sprints/${sprintId}`)
            const sprintResponse = response?.data;

            if (sprintResponse?.sprint?.id) {
                setLoading(false)
                setData(sprintResponse)
            }
        } catch (error) {
            setError(true)
            setLoading(false)
        }
    };

    useEffect(() => {
        if (sprintId !== 0) {
            fetchSprint()
        }
    }, [sprintId]);

    return {data, error, loading, refetch: fetchSprint};
};

export default useFetchSprint;
