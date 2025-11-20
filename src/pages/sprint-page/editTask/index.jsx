import MainPageLayout from '../../../layouts/MainPageLayout.jsx'
import SprintListPage from '../SprintListPage.jsx'
import EditTaskContent from '../../../components/task/edit/EditTask.jsx'

const EditTaskLayout = () => {
    return (
        <MainPageLayout
            title="Sprint"
            leftColumn={<SprintListPage/>}
            rightColumn={<EditTaskContent/>}
        />
    );
}

export default EditTaskLayout;