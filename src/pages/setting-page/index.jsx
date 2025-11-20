import MainPageLayout from '../../layouts/MainPageLayout.jsx'
import SettingPage from "./SettingPage.jsx";
import SettingContentPage from "./SettingContentPage.jsx";

const SettingLayout = () => {
    return (
        <MainPageLayout
            title="Settings"
            leftColumn={<SettingPage/>}
            rightColumn={<SettingContentPage/>}
        />
    );
}

export default SettingLayout;