import axios from 'axios';
import {useEffect, useState} from 'react';

const useFetchTaskAttributes = (sprintId) => {
    const [data, setData] = useState({});
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchTaskAttributes = async () => {
        setLoading(true)
        setError(false)
        try {
            const response = await axios.get(`/sprints/${sprintId}/task-attributes`)
            const attributesResponse = response?.data;

            if (attributesResponse?.taskAttributes) {
                setLoading(false)
                setData(attributesResponse?.taskAttributes)
            }
        } catch (error) {
            setError(true)
            setLoading(false)
        }
    };

    useEffect(() => {
        if (sprintId !== 0) {
            fetchTaskAttributes()
        }
    }, [sprintId]);

    return {data, error, loading};
};

export default useFetchTaskAttributes;
