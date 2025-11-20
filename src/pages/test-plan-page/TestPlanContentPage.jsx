import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import TestSuiteContentPage from "./TestSuiteContentPage.jsx";
import TestPlanEditComponent from "./TestPlanEditComponent.jsx";

const TestPlanContentPage = () => {
    const {test_plan_id} = useParams();

    const [testPlanId, setTestPlanId] = useState(Number(test_plan_id) || 0);

    useEffect(() => {
        if (test_plan_id) {
            setTestPlanId(Number(test_plan_id));
        } else {
            setTestPlanId(0)
        }
    }, [test_plan_id]);

    return testPlanId > 0 ? <TestPlanEditComponent test_plan_id={test_plan_id}/> : <TestSuiteContentPage/>;
};

export default TestPlanContentPage;