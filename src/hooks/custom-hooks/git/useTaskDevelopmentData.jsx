import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  doGetTaskDevelopmentData,
  selectTaskDevelopmentData,
  selectIsLoading,
  selectError,
} from '../../../state/slice/gitIntegrationSlice';

const useTaskDevelopmentData = (taskID) => {
  const dispatch = useDispatch();
  const developmentData = useSelector(selectTaskDevelopmentData);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  useEffect(() => {
    if (taskID) {
      dispatch(doGetTaskDevelopmentData(taskID));
    }
  }, [dispatch, taskID]);

  const refetch = () => {
    if (taskID) {
      dispatch(doGetTaskDevelopmentData(taskID));
    }
  };

  return { developmentData, isLoading, error, refetch };
};

export default useTaskDevelopmentData;

