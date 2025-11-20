import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectSelectedProject } from "../../state/slice/projectSlice.js";
import SearchBar from "../../components/SearchBar.jsx";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline/index.js";
import SkeletonLoader from "../../components/SkeletonLoader.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import {
  doGetReleases,
  selectIsReleaseListForProjectError,
  selectIsReleaseListForProjectLoading,
  selectReleaseListForProject,
  selectSelectedRelease,
  setSelectedRelease,
} from "../../state/slice/releaseSlice.js";
import axios from "axios";
import { useToasts } from "react-toast-notifications";
import ConfirmationDialog from "../../components/ConfirmationDialog.jsx";

const ReleaseListPage = () => {
  const { addToast } = useToasts();
  const dispatch = useDispatch();
  const selectedProject = useSelector(selectSelectedProject);
  const releases = useSelector(selectReleaseListForProject);
  const releaseLoading = useSelector(selectIsReleaseListForProjectLoading);
  const releaseError = useSelector(selectIsReleaseListForProjectError);
  const selectedRelease = useSelector(selectSelectedRelease);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  const [filteredReleases, setFilteredReleases] = useState([]);
  const [toDeleteRelease, setToDeleteRelease] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({
    unreleased: true,
    released: false,
  });

  const [filterCounts, setFilterCounts] = useState({
    unreleased: 0,
    released: 0,
  });

  

  useEffect(() => {
    
  }, [selectedRelease]);

  const filteredReleaseList = releases.filter((release) => {
    // If both filters are unchecked, show nothing
    if (!selectedFilters.unreleased && !selectedFilters.released) {
      return false;
    }

    // Return true if the release status matches selected filters
    if (selectedFilters.unreleased && release.status === "UNRELEASED")
      return true;
    if (selectedFilters.released && release.status === "RELEASED") return true;

    return false;
  });

  const handleFilterChange = (filterName) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterName]: !prev[filterName],
    }));
  };

  useEffect(() => {
    if (selectedProject?.id) {
      dispatch(doGetReleases(selectedProject?.id));
    }
  }, [selectedProject]);

  useEffect(() => {
    if (releases.length) {
      const unreleasedCount = releases.filter(
        (release) => release.status === "UNRELEASED"
      ).length;
      const releasedCount = releases.filter(
        (release) => release.status === "RELEASED"
      ).length;

      setFilteredReleases(releases);
      setFilterCounts({
        unreleased: unreleasedCount,
        released: releasedCount,
      });
    }
  }, [releases]);

  const handleSearch = (term) => {
    if (term.trim() === "") {
      setFilteredReleases(releases);
    } else {
      const filtered = releases.filter((tp) =>
        tp?.name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredReleases(filtered);
    }
  };

  const handleDeleteClick = (release) => {
    setToDeleteRelease(release);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (toDeleteRelease) {
      axios
        .delete(`/releases/${toDeleteRelease.rID}`)
        .then((response) => {
          const deleted = response?.data?.status;

          if (deleted) {
            addToast("Release Successfully Deleted", { appearance: "success" });
            dispatch(doGetReleases(selectedProject?.id));
          } else {
            addToast("Failed to delete release ", { appearance: "error" });
          }
        })
        .catch(() => {
          addToast("Release delete request failed ", { appearance: "error" });
        });
    }
    setIsDialogOpen(false);
  };

  const toggleMenuOpen = (index, event) => {
    if (openMenu?.index === index) {
      setOpenMenu(null);
    } else {
      setOpenMenu({
        index: index,
        position: {
          top: event.screenY,
        },
      });
    }
  };

  if (releaseLoading)
    return (
      <div className="p-2">
        <SkeletonLoader />
      </div>
    );
  if (releaseError) return <ErrorAlert message="Cannot get release list" />;

  return (
    <div className="h-list-screen overflow-y-auto w-full">
      {releaseLoading ? (
        <div className="p-2">
          <SkeletonLoader />
        </div>
      ) : (
        <div className="flex-col gap-4">
          <div className="flex flex-col gap-4  pl-3 pr-3">
            <SearchBar onSearch={handleSearch} />
            <div className="flex w-full laptopL:w-60 gap-5 justify-start ml-3">
              <button
                className={`px-2 py-1 rounded-xl text-xs ${selectedFilters.released ? "bg-primary-pink text-white" : "bg-gray-200"}`}
                onClick={() => handleFilterChange("released")}
              >
                Released ({filterCounts.released})
              </button>
              <button
                className={`px-2 py-1 rounded-xl text-xs ${selectedFilters.unreleased ? "bg-primary-pink text-white" : "bg-gray-200"}`}
                onClick={() => handleFilterChange("unreleased")}
              >
                Unreleased ({filterCounts.unreleased})
              </button>
            </div>
          </div>
          <div className="h-[calc(100vh-250px)] overflow-y-auto flex flex-col gap-3 pl-3 pr-1 mt-6">
            {filteredReleaseList.map((element, index) => (
              <button
                key={index}
                style={{ width: "266px" }}
                className={`flex justify-between items-center p-3 border rounded-md w-full gap-2 hover:bg-gray-100 cursor-pointer ${
                  selectedRelease?.rID === element.rID
                    ? "border-primary-pink"
                    : "border-gray-200"
                }`}
                onClick={() => {
                  dispatch(setSelectedRelease(element));
                  
                }}
              >
                <div className="text-left">
                  <div className="font-bold mb-1">{element?.name}</div>
                  <div className="flex text-xs text-gray-600 items-center">
                    {element?.type?.name}
                  </div>
                </div>
                <div className="flex gap-1">
                  <div onClick={(event) => toggleMenuOpen(index, event)}>
                    <EllipsisVerticalIcon className="w-4 h-4 text-black" />
                  </div>
                  {openMenu?.index === index && (
                    <div
                      style={{
                        position: "absolute",
                        top: `calc(${openMenu.position.top}px - 215px)`,
                      }}
                      className="mt-2 w-24 left-full bg-white rounded-md shadow-lg z-10 border border-gray-200"
                    >
                      <button
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 focus:outline-none cursor-pointer z-20"
                        onClick={() => handleDeleteClick(element)}
                      >
                        DELETE
                      </button>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
        }}
        onConfirm={handleConfirmDelete}
        message={
          toDeleteRelease ? `To delete release - ${toDeleteRelease.name} ?` : ""
        }
      />
    </div>
  );
};

export default ReleaseListPage;
