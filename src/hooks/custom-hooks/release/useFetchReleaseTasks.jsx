import axios from "axios";
import { useEffect, useState } from "react";

const useFetchReleaseTasks = (releaseId) => {
  const [data, setData] = useState({ tasks: [] });
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchReleaseTasks = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await axios.get(`/releases/${releaseId}/tasks`, {
        headers: { Accept: "application/json" },
      });
      const releaseTasksResponse = response?.data;
      if (releaseTasksResponse?.tasks) {
        const tasksWithAttributes = releaseTasksResponse.tasks.map((task) => ({
          ...task,
          attributes: {
            status:
              task.attributes?.status?.value != null
                ? task.attributes.status
                : { id: "", value: "N/A" },
            priority:
              task.attributes?.priority?.value != null
                ? task.attributes.priority
                : { id: "", value: "N/A" },
            startDate:
              task.attributes?.startDate?.value != null
                ? task.attributes.startDate
                : { value: "N/A" },
            endDate:
              task.attributes?.endDate?.value != null
                ? task.attributes.endDate
                : { value: "N/A" },
          },
        }));
        setLoading(false);
        setData({ tasks: tasksWithAttributes });
      }
    } catch (error) {
      setError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (releaseId) {
      fetchReleaseTasks();
    }
  }, [releaseId]);

  return { data, error, loading, refetch: fetchReleaseTasks };
};

export default useFetchReleaseTasks;
