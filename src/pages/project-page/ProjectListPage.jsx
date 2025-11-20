import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {
  selectProjectList,
  selectSelectedProjectFromList,
  setSelectedProject,
  setSelectedProjectFromList
} from "../../state/slice/projectSlice.js";
import SearchBar from "../../components/SearchBar.jsx";
import {ChevronRightIcon, TrashIcon} from "@heroicons/react/24/outline/index.js";
import ConfirmationDialog from "../../components/ConfirmationDialog.jsx";
import axios from "axios";
import {useToasts} from "react-toast-notifications";
import {doGetWhoAmI} from "../../state/slice/authSlice.js";

const ProjectListPage = () => {
  const { addToast } = useToasts();
  const dispatch = useDispatch();
  const projectList = useSelector(selectProjectList);
  const selectedProject = useSelector(selectSelectedProjectFromList);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [filteredProjectList, setFilteredProjectList] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    active: true,
    onHold: false,
    closed: false,
  });

  const [filterCounts, setFilterCounts] = useState({
    active: 0,
    onHold: 0,
    closed: 0,
  });

  useEffect(() => {
    if (projectList && Array.isArray(projectList)) {
      const activeCount = projectList.filter(project => project.status === "Active").length;
      const onHoldCount = projectList.filter(project => project.status === "On Hold").length;
      const closedCount = projectList.filter(project => project.status === "Closed").length;

      setFilterCounts({
        active: activeCount,
        onHold: onHoldCount,
        closed: closedCount,
      });

      setFilteredProjectList(projectList);
    }
  }, [projectList]);

  const handleSearch = (term) => {
    let filtered = projectList;

    if (term.trim() !== '') {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(term.toLowerCase())
      );
    }

    setFilteredProjectList(filtered);
  };

  const filteredList = projectList.filter((project) => {
    // If all filters are unchecked, show nothing
    if (!selectedFilters.active && !selectedFilters.onHold && !selectedFilters.closed) {
      return false;
    }

    if (selectedFilters.active && project.status === "Active")
      return true;
    if (selectedFilters.onHold && project.status === "On Hold")
      return true;
    if (selectedFilters.closed && project.status === "Closed")
      return true;

    return false;
  });

  const handleFilterChange = (filterName) => {
    setSelectedFilters(prevState => ({
      ...prevState,
      [filterName]: !prevState[filterName]
    }));
  };

  const handleDeleteClick = (project) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedProject) {
      axios.delete(`/projects/${selectedProject.id}`)
        .then(response => {
          addToast('Project Successfully Deleted', { appearance: 'success' });
          dispatch(doGetWhoAmI());
        }).catch(() => {
          addToast('Project delete request failed ', { appearance: 'error' });
        });
    }
    setIsDialogOpen(false);
    setSelectedProject(null);
  };

  return (
    <div className="h-list-screen w-full">
      <div className="flex-col gap-4">
        <div className='flex flex-col gap-4  pl-3 pr-3'>
          <SearchBar onSearch={handleSearch} />
          <div className="flex w-full laptopL:w-60 justify-between ml-3">
            {["active", "onHold", "closed"].map((filter) => (
              <button
                key={filter}
                className={`px-2 py-1 rounded-xl text-xs ${selectedFilters[filter] ? "bg-primary-pink text-white" : "bg-gray-200"
                  }`}
                onClick={() => handleFilterChange(filter)}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)} ({filterCounts[filter]})
              </button>
            ))}
          </div>
        </div>

      </div>

      <div className="h-[calc(100vh-250px)] overflow-y-auto flex flex-col gap-3 pl-5 pr-1 mt-6">
        {filteredList.length === 0 ? (
          <div className="text-center text-gray-600">No projects found</div>
        ) : (
          filteredList.map((project) => (
            <div
            style={{width:"256px"}}
                onClick={() => dispatch(setSelectedProjectFromList(project))}
              key={project.id}
                className={`flex justify-between items-center p-3 border rounded-md w-full gap-2 hover:bg-gray-100 cursor-pointer ${selectedProject?.id === project.id ? 'border-primary-pink' : 'border-gray-200'}`}
            >
              <div className="col-span-2 text-left flex flex-col gap-1">
                <div className="font-bold">{project.name}</div>
                <div className="text-xs text-gray-600">Website • Development</div>
              </div>
              <div className="flex gap-1">
                <TrashIcon
                  onClick={() => handleDeleteClick(project)}
                  className="w-4 h-4 text-pink-700 cursor-pointer z-10"
                />
                <ChevronRightIcon
                  className="w-4 h-4 text-black cursor-pointer"
                />
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedProject(null);
        }}
        onConfirm={handleConfirmDelete}
        message={selectedProject ? `To delete project - ${selectedProject.name} ?` : ''}
      />
    </div>
  );
};

export default ProjectListPage;
