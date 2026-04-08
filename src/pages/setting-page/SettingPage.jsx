import React from 'react';
import { useDispatch, useSelector } from "react-redux";
import { setSettingView, settingView, selectedCategory, setSelectedCategory } from '../../state/slice/settingSlice.js';

const SettingPage = () => {
    const dispatch = useDispatch();
    const currentView = useSelector(settingView);
    const currentCategory = useSelector(selectedCategory);

    const categories = [
        { id: 'general', name: 'General' },
        { id: 'projectManagement', name: 'Project Management' },
        { id: 'integrations', name: 'Integrations' }
    ];

    const settingItems = {
        general: [
            { id: 'notifications', name: 'Notifications', description: 'Manage Notifications' }
        ],
        projectManagement: [
            { id: 'customFields', name: 'Custom Fields', description: 'Manage Custom Fields' },
            { id: 'screens', name: 'Screens', description: 'Manage Screens' },
            { id: 'taskTypes', name: 'Task Types', description: 'Manage Task Types' },
            { id: 'templates', name: 'Templates', description: 'Manage Templates' }
        ],
        integrations: [
            { id: 'oauthSettings', name: 'OAuth Configuration', description: 'Manage OAuth Configuration' },
            { id: 'gitIntegration', name: 'Git Integration', description: 'Manage Git Integration' }
        ]
    };

    const handleCategoryChange = (e) => {
        const newCategory = e.target.value;
        dispatch(setSelectedCategory(newCategory));
        const firstItem = settingItems[newCategory][0];
        if (firstItem) {
            dispatch(setSettingView(firstItem.id));
        }
    };

    return (
        <div className="h-list-screen overflow-y-auto w-full flex flex-col space-y-2 gap-3 pl-3 pr-1">
            <div className="mb-4">
                <select
                    value={currentCategory}
                    onChange={handleCategoryChange}
                    style={{ width: "266px", height: "50px" }}
                    className="p-3 border border-gray-300 rounded-md w-full cursor-pointer focus:outline-none focus:border-primary-pink"
                >
                    {categories.map(category => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            {settingItems[currentCategory]?.map(item => (
                <button
                    key={item.id}
                    onClick={() => dispatch(setSettingView(item.id))}
                    style={{ width: "266px", minHeight: "60px" }}
                    className={`flex flex-col items-start p-3 border rounded-md w-full hover:bg-gray-100 cursor-pointer ${currentView === item.id ? 'border-primary-pink' : 'border-gray-200'}`}
                >
                    <span className="font-medium text-gray-900">{item.name}</span>
                    <span className="text-sm text-green-600 mt-1">{item.description}</span>
                </button>
            ))}
        </div>
    );
};

export default SettingPage;
