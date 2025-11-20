import axios from "axios";
import { useEffect, useState } from "react";
import { useToasts } from "react-toast-notifications";

const useFetchReleaseTypes = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToasts();

  const fetchReleaseTypes = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await axios.get("releases/types");
      const releaseTypesResponse = response?.data?.releaseType;
      setData(releaseTypesResponse || []);
      setLoading(false);
    } catch (error) {
      setError(true);
      setLoading(false);
      addToast("Failed To Get Release Types", { appearance: "error" });
    }
  };

  useEffect(() => {
    fetchReleaseTypes();
  }, []);

  return { data, error, loading, refetch: fetchReleaseTypes };
};

export default useFetchReleaseTypes;
