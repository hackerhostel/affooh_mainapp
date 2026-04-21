import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  doGetUserTasks,
  selectIsUserTasksError,
  selectIsUserTasksLoading,
  selectUserTasks,
} from "../../../state/slice/userTasksSlice";

const useUserTasks = (userId) => {
  const dispatch = useDispatch();
  const userTasks = useSelector(selectUserTasks);
  const loading = useSelector(selectIsUserTasksLoading);
  const error = useSelector(selectIsUserTasksError);

  const [data, setData] = useState({ tasks: [] });

  useEffect(() => {
  if (userId) {
    dispatch(doGetUserTasks(userId));
  } else {
    setData({ tasks: [] });
  }
}, [userId, dispatch]);

  useEffect(() => {
    if (userTasks && Array.isArray(userTasks)) {
      setData({ tasks: userTasks });
    } else {
      setData({ tasks: [] });
    }
  }, [userTasks]);

  const refetch = () => {
    if (userId && (typeof userId === "string" || typeof userId === "number")) {
      dispatch(doGetUserTasks(userId));
    }
  };

  return {
    data,
    error,
    loading,
    refetch,
  };
};

export default useUserTasks;
