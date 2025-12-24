import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  doGetRepositories,
  selectRepositories,
  selectIsLoading,
  selectError,
} from '../../../state/slice/gitIntegrationSlice';

const useGitRepositories = (projectID) => {
  const dispatch = useDispatch();
  const repositories = useSelector(selectRepositories);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  useEffect(() => {
    if (projectID) {
      dispatch(doGetRepositories({ projectID }));
    } else {
      dispatch(doGetRepositories());
    }
  }, [dispatch, projectID]);

  const refetch = () => {
    if (projectID) {
      dispatch(doGetRepositories({ projectID }));
    } else {
      dispatch(doGetRepositories());
    }
  };

  return { repositories, isLoading, error, refetch };
};

export default useGitRepositories;

