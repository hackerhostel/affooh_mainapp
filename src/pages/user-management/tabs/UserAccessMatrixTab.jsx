import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { selectProjectList, selectSelectedProject } from "../../../state/slice/projectSlice";

const ACCESS_LEVELS = ["N/A", "Root", "Admin", "Member"];

const ASSET_TABS = [
  { key: "HW", label: "Hardware", endpoint: "/assets/hardware" },
  { key: "SW", label: "Software", endpoint: "/assets/software" },
  { key: "Data", label: "Data", endpoint: "/assets/data" },
  { key: "Cloud", label: "Cloud", endpoint: "/assets/cloud" },
];

const UserAccessMatrixTab = ({ userId }) => {
  const [activeAssetTab, setActiveAssetTab] = useState("HW");
  const [assets, setAssets] = useState({ HW: [], SW: [], Data: [], Cloud: [] });
  const [accessMap, setAccessMap] = useState({});
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const projectList = useSelector(selectProjectList) || [];
  const selectedProject = useSelector(selectSelectedProject);

  // Build project IDs: always use all projects so we don't miss assets
  // that belong to a different project than the currently selected one
  const getProjectIds = () => {
    const fromList = projectList.map((p) => p.id).filter(Boolean);
    if (fromList.length) return fromList;
    // Fallback: use current selected project if list hasn't loaded yet
    if (selectedProject?.id) return [selectedProject.id];
    return [];
  };

  const fetchAssets = async () => {
    if (!userId) return;
    const pIds = getProjectIds();
    if (!pIds.length) return;

    setAssetsLoading(true);
    try {
      const allRequests = [];

      pIds.forEach((pId) => {
        ASSET_TABS.forEach((tab) => {
          // Always filter by assigneeID for HW across all projects
          // so we only show assets that belong to this user
          let url = `${tab.endpoint}/project/${pId}`;
          if (tab.key === "HW") {
            url += `?assigneeID=${userId}`;
          }

          allRequests.push(
            axios
              .get(url)
              .then((res) => {
                // AssetService returns: { body: { assets: [...], total: N } }
                // OR for some endpoints: { body: [...] }
                const body = res.data?.body;
                let arr = [];
                if (Array.isArray(body)) {
                  arr = body;
                } else if (body && Array.isArray(body.assets)) {
                  arr = body.assets;
                }
                return { tabKey: tab.key, data: arr };
              })
              .catch(() => ({ tabKey: tab.key, data: [] }))
          );
        });
      });

      const results = await Promise.allSettled(allRequests);
      const newAssets = { HW: [], SW: [], Data: [], Cloud: [] };
      const seenIds = {
        HW: new Set(),
        SW: new Set(),
        Data: new Set(),
        Cloud: new Set(),
      };

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          const { tabKey, data } = result.value;
          data.forEach((asset) => {
            if (!seenIds[tabKey].has(asset.id)) {
              seenIds[tabKey].add(asset.id);
              newAssets[tabKey].push(asset);
            }
          });
        }
      });

      setAssets(newAssets);
    } catch (err) {
      console.error("UserAccessMatrixTab fetchAssets error:", err);
    } finally {
      setAssetsLoading(false);
    }
  };

  const fetchUserAccess = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`/compliance/user-access/user/${userId}`);
      // ComplianceService returns: { body: [...records] }
      const body = res.data?.body;
      const data = Array.isArray(body) ? body : [];

      const map = {};
      data.forEach((entry) => {
        // Composite key: "HW-5", "SW-12", etc.
        map[`${entry.assetType}-${entry.assetId}`] = entry.accessLevel;
      });
      setAccessMap(map);
    } catch {
      // No access data yet — silently ignore
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchAssets();
    fetchUserAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, projectList.length]);

  const handleAccessChange = async (asset, accessLevel) => {
    const assetId = asset.id;
    const mapKey = `${activeAssetTab}-${assetId}`;
    const prevLevel = accessMap[mapKey];

    // Optimistic update
    setAccessMap((prev) => ({ ...prev, [mapKey]: accessLevel }));
    setSavingId(assetId);

    try {
      await axios.post("/compliance/user-access", {
        userId,
        assetId,
        assetType: activeAssetTab,
        assetName:
          asset.assetName ||
          asset.name ||
          asset.softwareName ||
          asset.hostName ||
          "",
        accessLevel,
      });
      toast.success("Access level updated successfully");
    } catch {
      // Rollback on failure
      setAccessMap((prev) => ({ ...prev, [mapKey]: prevLevel }));
      toast.error("Failed to save access level");
    } finally {
      setSavingId(null);
    }
  };

  const currentAssets = assets[activeAssetTab] || [];

  const getAssetDisplayName = (asset) =>
    asset.assetName ||
    asset.softwareName ||
    asset.dataAssetName ||
    asset.cloudAssetName ||
    asset.name ||
    asset.hostName ||
    "-";

  return (
    <div>
      {/* Asset type sub-tabs */}
      <div className="flex gap-0 mb-4 border-b border-gray-200">
        {ASSET_TABS.map((tab) => {
          const count = assets[tab.key]?.length || 0;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveAssetTab(tab.key)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeAssetTab === tab.key
                  ? "border-primary-pink text-primary-pink"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 ${
                    activeAssetTab === tab.key
                      ? "bg-pink-100 text-pink-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Asset Table */}
      {assetsLoading ? (
        <p className="text-center py-4 text-gray-500">Loading assets...</p>
      ) : currentAssets.length === 0 ? (
        <p className="text-center py-8 text-gray-400">
          No {ASSET_TABS.find((t) => t.key === activeAssetTab)?.label} assets
          assigned to this user
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3 px-2">#</th>
                <th className="pb-3 px-2">Asset Name</th>
                <th className="pb-3 px-2">Access Level</th>
              </tr>
            </thead>
            <tbody>
              {currentAssets.map((asset, index) => (
                <tr
                  key={asset.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-2 text-gray-500">{index + 1}</td>
                  <td className="py-3 px-2 font-medium">
                    {getAssetDisplayName(asset)}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={
                          accessMap[`${activeAssetTab}-${asset.id}`] || "N/A"
                        }
                        onChange={(e) =>
                          handleAccessChange(asset, e.target.value)
                        }
                        disabled={savingId === asset.id}
                        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm min-w-[120px] disabled:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-pink-300"
                      >
                        {ACCESS_LEVELS.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                      {savingId === asset.id && (
                        <span className="text-xs text-gray-400">Saving...</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserAccessMatrixTab;
