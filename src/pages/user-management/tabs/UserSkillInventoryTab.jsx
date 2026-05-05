import React, { useState, useEffect } from "react";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { toast } from "react-toastify";
import ConfirmationDialog from "../../../components/ConfirmationDialog";

const PROFICIENCY_LEVELS = ["Beginner", "Intermediate", "Advance"];

const emptySkillForm = {
  skill: "",
  certification: "",
  yearsOfExperience: "",
  proficiencyLevel: "Beginner",
};

const UserSkillInventoryTab = ({ userId }) => {
  const [jobTitle, setJobTitle] = useState("");
  const [isEditingJobTitle, setIsEditingJobTitle] = useState(false);
  const [jobTitleInput, setJobTitleInput] = useState("");
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [newSkill, setNewSkill] = useState(emptySkillForm);
  const [editSkill, setEditSkill] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState(null);

  const fetchData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axios.get(`/compliance/skill-inventory/user/${userId}`);
      const data = res.data?.body || res.data;
      setJobTitle(data?.jobTitle || "");
      setJobTitleInput(data?.jobTitle || "");
      setSkills(data?.skills || []);
    } catch {
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const saveJobTitle = async () => {
    try {
      await axios.put(`/compliance/skill-inventory/user/${userId}/job-title`, {
        jobTitle: jobTitleInput,
      });
      setJobTitle(jobTitleInput);
      setIsEditingJobTitle(false);
      toast.success("Job title updated");
    } catch {
      toast.error("Failed to update job title");
    }
  };

  const addSkill = async () => {
    if (!newSkill.skill.trim()) {
      toast.error("Skill name is required");
      return;
    }
    try {
      const res = await axios.post("/compliance/skill-inventory", {
        userId,
        ...newSkill,
      });
      const created = res.data?.body || res.data;
      setSkills((prev) => [...prev, created]);
      setNewSkill(emptySkillForm);
      setShowAddForm(false);
      toast.success("Skill added");
    } catch {
      toast.error("Failed to add skill");
    }
  };

  const startEdit = (skill) => {
    setEditingSkillId(skill.id);
    setEditSkill({ ...skill });
  };

  const saveEdit = async () => {
    try {
      await axios.put(`/compliance/skill-inventory/${editingSkillId}`, editSkill);
      setSkills((prev) =>
        prev.map((s) => (s.id === editingSkillId ? { ...s, ...editSkill } : s))
      );
      setEditingSkillId(null);
      toast.success("Skill updated");
    } catch {
      toast.error("Failed to update skill");
    }
  };

  const deleteSkill = (id) => {
    setSkillToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!skillToDelete) return;
    try {
      await axios.delete(`/compliance/skill-inventory/${skillToDelete}`);
      setSkills((prev) => prev.filter((s) => s.id !== skillToDelete));
      toast.success("Skill deleted");
    } catch {
      toast.error("Failed to delete skill");
    } finally {
      setDeleteModalOpen(false);
      setSkillToDelete(null);
    }
  };



  return (
    <div>
      {/* Job Title */}
      <div className="mb-6 flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
          Job Title:
        </span>
        {isEditingJobTitle ? (
          <>
            <input
              type="text"
              value={jobTitleInput}
              onChange={(e) => setJobTitleInput(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm flex-1 max-w-xs"
              placeholder="Enter job title"
            />
            <button
              onClick={saveJobTitle}
              className="text-green-600 hover:text-green-700"
            >
              <CheckIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setIsEditingJobTitle(false);
                setJobTitleInput(jobTitle);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            <span className="text-sm text-gray-800">{jobTitle || "-"}</span>
            <button
              onClick={() => setIsEditingJobTitle(true)}
              className="text-gray-400 hover:text-gray-600"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Skills Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="font-semibold text-gray-700">Skills</span>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-primary-pink text-white text-sm rounded-md hover:opacity-90"
        >
          <PlusIcon className="w-4 h-4" /> Add Skill
        </button>
      </div>

      {/* Add Skill Form */}
      {showAddForm && (
        <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Skill *
              </label>
              <input
                type="text"
                value={newSkill.skill}
                onChange={(e) =>
                  setNewSkill({ ...newSkill, skill: e.target.value })
                }
                placeholder="e.g. React.js"
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Certification
              </label>
              <input
                type="text"
                value={newSkill.certification}
                onChange={(e) =>
                  setNewSkill({ ...newSkill, certification: e.target.value })
                }
                placeholder="e.g. AWS Certified"
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Years of Experience
              </label>
              <input
                type="number"
                value={newSkill.yearsOfExperience}
                onChange={(e) =>
                  setNewSkill({
                    ...newSkill,
                    yearsOfExperience: e.target.value,
                  })
                }
                placeholder="e.g. 3"
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                min="0"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Proficiency Level
              </label>
              <select
                value={newSkill.proficiencyLevel}
                onChange={(e) =>
                  setNewSkill({ ...newSkill, proficiencyLevel: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm"
              >
                {PROFICIENCY_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addSkill}
              className="px-4 py-1.5 bg-primary-pink text-white text-sm rounded-md hover:opacity-90"
            >
              Save
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewSkill(emptySkillForm);
              }}
              className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Skills Table */}
      {loading ? (
        <p className="text-center py-4 text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3 px-2">#</th>
                <th className="pb-3 px-2">Skill</th>
                <th className="pb-3 px-2">Certification</th>
                <th className="pb-3 px-2">Years of Experience</th>
                <th className="pb-3 px-2">Proficiency Level</th>
                <th className="pb-3 px-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {skills.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-gray-500"
                  >
                    No skills added yet
                  </td>
                </tr>
              ) : (
                skills.map((skill, index) =>
                  editingSkillId === skill.id ? (
                    <tr key={skill.id} className="border-b bg-gray-50">
                      <td className="py-2 px-2">{index + 1}</td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={editSkill.skill}
                          onChange={(e) =>
                            setEditSkill({ ...editSkill, skill: e.target.value })
                          }
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={editSkill.certification}
                          onChange={(e) =>
                            setEditSkill({
                              ...editSkill,
                              certification: e.target.value,
                            })
                          }
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          value={editSkill.yearsOfExperience}
                          onChange={(e) =>
                            setEditSkill({
                              ...editSkill,
                              yearsOfExperience: e.target.value,
                            })
                          }
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
                          min="0"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <select
                          value={editSkill.proficiencyLevel}
                          onChange={(e) =>
                            setEditSkill({
                              ...editSkill,
                              proficiencyLevel: e.target.value,
                            })
                          }
                          className="border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          {PROFICIENCY_LEVELS.map((l) => (
                            <option key={l} value={l}>
                              {l}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={saveEdit}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingSkillId(null)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr
                      key={skill.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-2">{index + 1}</td>
                      <td className="py-3 px-2 font-medium">{skill.skill}</td>
                      <td className="py-3 px-2">{skill.certification || "-"}</td>
                      <td className="py-3 px-2">
                        {skill.yearsOfExperience
                          ? `${skill.yearsOfExperience} yr${skill.yearsOfExperience != 1 ? "s" : ""}`
                          : "-"}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            skill.proficiencyLevel === "Advance"
                              ? "bg-green-100 text-green-700"
                              : skill.proficiencyLevel === "Intermediate"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {skill.proficiencyLevel}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => startEdit(skill)}
                            title="Edit skill"
                            className="text-gray-400 hover:text-gray-700 transition-colors"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteSkill(skill.id)}
                            title="Delete skill"
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Skill?"
        message="Are you sure you want to delete this skill? This action cannot be undone."
      />
    </div>
  );
};

export default UserSkillInventoryTab;
