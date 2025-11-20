import MainPageLayout from '../../layouts/MainPageLayout.jsx'
import TestPlanListPage from "./TestPlanListPage.jsx";
import TestPlanContentPage from "./TestPlanContentPage.jsx";
import TestPlanCreateComponent from "./TestPlanCreateComponent.jsx";
import {useState} from "react";

const TestPlanLayout = () => {
    const [isOpen, setIsOpen] = useState(false);

    const onAddNew = () => {
        setIsOpen(true)
    }

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <>
            <MainPageLayout
                title="Test plan"
                leftColumn={<TestPlanListPage/>}
                rightColumn={<TestPlanContentPage/>}
                subText={"Add New"}
                onAction={onAddNew}
            />
            <TestPlanCreateComponent onClose={handleClose} isOpen={isOpen}/>
        </>
    );
}

export default TestPlanLayout;