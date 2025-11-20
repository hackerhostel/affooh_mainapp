import { useState, useEffect, useCallback, useRef } from 'react';

export default function useValidation(schema, values) {
  const ref = useRef(null);

  const [validationErrors, setValidationErrors] = useState(null);

  const runValidation = useCallback(
    (currentValue, currentSchema) =>
      currentSchema
        .validate(currentValue, { abortEarly: false })
        .then(() => setValidationErrors(null))
        .catch((validationResult) => {
          const { inner } = validationResult;
          let errorObject = inner?.reduce(
            (parsedErrors, { path, errors }) => ({
              ...parsedErrors,
              [path]: errors,
            }),
            {},
          );
          setValidationErrors(errorObject);
          return errorObject;
        }),
    [],
  );
  useEffect(() => {
    const valuesString = JSON.stringify(values);

    if (ref.current !== valuesString) {
      ref.current = valuesString;
      runValidation(values, schema);
    }
  }, [values, schema, runValidation]);

  return [validationErrors];
}
