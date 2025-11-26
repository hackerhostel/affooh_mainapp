import React, { useState, useEffect, useMemo } from 'react';

/**
 * Dynamic Role Permissions Editor Component
 *
 * This component renders a dynamic UI for managing role permissions based on a template.
 * It supports toggling modules on/off and managing individual permissions within each module.
 *
 * @param {Object} template - The template object from the API containing modules and permissions structure
 * @param {Object} initialPermissions - Initial permission values (for edit mode)
 * @param {Function} onChange - Callback function called when permissions change
 */
const RolePermissionsEditor = ({ template, initialPermissions = {}, onChange }) => {
  const [enabledModules, setEnabledModules] = useState([]);
  const [permissions, setPermissions] = useState({});

  // Create a stable key for initialPermissions to detect real changes
  const initialPermissionsKey = useMemo(
    () => JSON.stringify(initialPermissions),
    [initialPermissions]
  );

  // Initialize enabled modules and permissions from template and initialPermissions
  useEffect(() => {
    if (!template) return;

    const { modules = [], permissions: templatePermissions = {} } = template;

    // Determine which modules should be enabled
    const modulesToEnable = [];
    const initialPerms = {};

    modules.forEach((moduleName) => {
      const modulePermissions = templatePermissions[moduleName];
      if (!modulePermissions) return;

      // Check if this module has any enabled permissions in initialPermissions
      const hasEnabledPermissions = initialPermissions.permissions?.[moduleName]
        ? Object.values(initialPermissions.permissions[moduleName]).some(
            (categoryPerms) => {
              if (typeof categoryPerms === 'object' && categoryPerms !== null) {
                return Object.values(categoryPerms).some(val => val === true);
              }
              return categoryPerms === true;
            }
          )
        : false;

      if (hasEnabledPermissions || initialPermissions.modules?.includes(moduleName)) {
        modulesToEnable.push(moduleName);
      }

      // Initialize permissions for this module
      Object.entries(modulePermissions).forEach(([category, actions]) => {
        if (!initialPerms[moduleName]) {
          initialPerms[moduleName] = {};
        }
        initialPerms[moduleName][category] = {};

        if (typeof actions === 'object' && actions !== null) {
          Object.keys(actions).forEach((action) => {
            const initialValue =
              initialPermissions.permissions?.[moduleName]?.[category]?.[action] ?? false;
            initialPerms[moduleName][category][action] = initialValue;
          });
        }
      });
    });

    setEnabledModules(modulesToEnable);
    setPermissions(initialPerms);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template, initialPermissionsKey]);

  useEffect(() => {
    // Only call onChange after permissions have been initialized from template
    if (!template || Object.keys(permissions).length === 0) {
      return;
    }

    const data = {
      modules: enabledModules,
      permissions: permissions,
    };

    if (onChange) {
      onChange(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabledModules, permissions, template]);

  const handleModuleToggle = (moduleName) => {
    setEnabledModules((prev) => {
      if (prev.includes(moduleName)) {
        // Disable module - set all its permissions to false
        setPermissions((prevPerms) => {
          const newPerms = { ...prevPerms };
          if (newPerms[moduleName]) {
            Object.keys(newPerms[moduleName]).forEach((category) => {
              Object.keys(newPerms[moduleName][category]).forEach((action) => {
                newPerms[moduleName][category][action] = false;
              });
            });
          }
          return newPerms;
        });
        return prev.filter((m) => m !== moduleName);
      } else {
        // Enable module
        return [...prev, moduleName];
      }
    });
  };

  const handlePermissionToggle = (moduleName, category, action) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName],
        [category]: {
          ...prev[moduleName]?.[category],
          [action]: !prev[moduleName]?.[category]?.[action],
        },
      },
    }));
  };

  const formatLabel = (str) => {
    // Convert camelCase or PascalCase to Title Case with spaces
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (char) => char.toUpperCase())
      .trim();
  };

  if (!template) {
    return (
      <div className="text-gray-500 text-sm">
        Loading permissions template...
      </div>
    );
  }

  if (!template.modules || !template.permissions) {
    return (
      <div className="text-red-500 text-sm border border-red-200 bg-red-50 p-4 rounded">
        <p className="font-semibold">Template Error:</p>
        <p>Invalid template structure. Expected 'modules' array and 'permissions' object.</p>
        <p className="mt-2 text-xs">Template received: {JSON.stringify(template)}</p>
      </div>
    );
  }

  const { modules = [], permissions: templatePermissions = {} } = template;

  return (
    <div className="space-y-8">
      <div>
        <h5 className="text-lg font-semibold text-gray-900 mb-5">Select Modules</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((moduleName) => {
            const isEnabled = enabledModules.includes(moduleName);
            return (
              <div
                key={moduleName}
                className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  isEnabled
                    ? 'border-primary-pink bg-pink-50 shadow-sm'
                    : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-sm'
                }`}
                onClick={() => handleModuleToggle(moduleName)}
              >
                <span className={`text-sm font-semibold ${
                  isEnabled ? 'text-gray-900' : 'text-gray-700'
                }`}>
                  {formatLabel(moduleName)}
                </span>
                <button
                  type="button"
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-pink ${
                    isEnabled ? 'bg-primary-pink' : 'bg-gray-300'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleModuleToggle(moduleName);
                  }}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                      isEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Permissions Section */}
      {enabledModules.length > 0 && (
        <div>
          <h5 className="text-lg font-semibold text-gray-900 mb-5">Configure Permissions</h5>
          <div className="space-y-6">
            {enabledModules.map((moduleName) => {
              const modulePermissions = templatePermissions[moduleName];
              if (!modulePermissions) return null;

              const categories = Object.entries(modulePermissions);
              
              // Split categories into two columns - right column should have 6 items
              const rightColumnSize = Math.min(6, categories.length);
              const leftColumnSize = categories.length - rightColumnSize;
              const leftColumn = categories.slice(0, leftColumnSize);
              const rightColumn = categories.slice(leftColumnSize);

              return (
                <div
                  key={moduleName}
                  className="border-2 border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <h6 className="text-base font-bold text-gray-900 mb-6 pb-3 border-b-2 border-gray-200">
                    {formatLabel(moduleName)}
                  </h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {leftColumn.map(([category, actions]) => {
                        if (typeof actions !== 'object' || actions === null) return null;

                        return (
                          <div key={category} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h7 className="text-sm font-bold text-gray-900 block mb-4 pb-2 border-b border-gray-300">
                              {formatLabel(category)}
                            </h7>
                            <div className="space-y-3">
                              {Object.entries(actions).map(([action, defaultValue]) => {
                                const isEnabled =
                                  permissions[moduleName]?.[category]?.[action] ?? defaultValue;
                                return (
                                  <div
                                    key={action}
                                    className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-white transition-colors"
                                  >
                                    <span className="text-sm font-medium text-gray-700">
                                      {formatLabel(action)}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handlePermissionToggle(moduleName, category, action)
                                      }
                                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                        isEnabled 
                                          ? 'bg-green-500 focus:ring-green-500' 
                                          : 'bg-gray-300 focus:ring-gray-400'
                                      }`}
                                    >
                                      <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                          isEnabled ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                      />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {rightColumn.map(([category, actions]) => {
                        if (typeof actions !== 'object' || actions === null) return null;

                        return (
                          <div key={category} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h7 className="text-sm font-bold text-gray-900 block mb-4 pb-2 border-b border-gray-300">
                              {formatLabel(category)}
                            </h7>
                            <div className="space-y-3">
                              {Object.entries(actions).map(([action, defaultValue]) => {
                                const isEnabled =
                                  permissions[moduleName]?.[category]?.[action] ?? defaultValue;

                                return (
                                  <div
                                    key={action}
                                    className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-white transition-colors"
                                  >
                                    <span className="text-sm font-medium text-gray-700 mr-2">
                                      {formatLabel(action)}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handlePermissionToggle(moduleName, category, action)
                                      }
                                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                        isEnabled 
                                          ? 'bg-green-500 focus:ring-green-500' 
                                          : 'bg-gray-300 focus:ring-gray-400'
                                      }`}
                                    >
                                      <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                          isEnabled ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                      />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {enabledModules.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-sm border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
          <p className="font-medium">Please select at least one module to configure permissions</p>
        </div>
      )}
    </div>
  );
};

export default RolePermissionsEditor;
