import React, { useState, useEffect } from "react";
import { PlusIcon, XMarkIcon, PencilIcon, CheckIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { toast } from "react-toastify";
import ConfirmationDialog from "../../../components/ConfirmationDialog";

const COMPETENCY_LEVELS = [
  "Excellent",
  "Good",
  "Moderate",
  "Need To Improve",
  "Poor",
];

const DEFAULT_SKILLS = [
  { key: "communication", label: "Communication" },
  { key: "technicalSkills", label: "Technical Skills" },
  { key: "leadership", label: "Leadership" },
  { key: "problemSolving", label: "Problem Solving" },
  { key: "domainKnowledge", label: "Domain Knowledge" },
];

const UserCompetencyMatrixTab = ({ userId }) => {
  const [competencyId, setCompetencyId] = useState(null);
  const [skills, setSkills] = useState(
    DEFAULT_SKILLS.map((s) => ({ ...s, level: "" }))
  );
  const [customSkills, setCustomSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newCustomSkillName, setNewCustomSkillName] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [skillToRemove, setSkillToRemove] = useState(null);

  const [editingCustomKey, setEditingCustomKey] = useState(null);
  const [editingLabel, setEditingLabel] = useState("");

  const fetchData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `/compliance/competency-matrix/user/${userId}`
      );
      const data = res.data?.body || res.data;
      if (data) {
        setCompetencyId(data.id);
        setSkills(
          DEFAULT_SKILLS.map((s) => ({ ...s, level: data[s.key] || "" }))
        );
        setCustomSkills(data.customSkills || []);
      }
    } catch {
      // No data yet — keep defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  const handleLevelChange = (key, level, isCustom = false) => {
    if (isCustom) {
      setCustomSkills((prev) =>
        prev.map((s) => (s.key === key ? { ...s, level } : s))
      );
    } else {
      setSkills((prev) =>
        prev.map((s) => (s.key === key ? { ...s, level } : s))
      );
    }
  };

  const saveCompetency = async () => {
    setSaving(true);
    const payload = { userId, customSkills };
    skills.forEach((s) => {
      payload[s.key] = s.level;
    });
    try {
      if (competencyId) {
        await axios.put(`/compliance/competency-matrix/${competencyId}`, payload);
      } else {
        const res = await axios.post("/compliance/competency-matrix", payload);
        const created = res.data?.body || res.data;
        setCompetencyId(created?.id);
      }
      toast.success("Competency matrix saved");
    } catch {
      toast.error("Failed to save competency matrix");
    } finally {
      setSaving(false);
    }
  };

  const addCustomSkill = () => {
    if (!newCustomSkillName.trim()) {
      toast.error("Skill name is required");
      return;
    }
    const key = `custom_${Date.now()}`;
    setCustomSkills((prev) => [
      ...prev,
      { key, label: newCustomSkillName.trim(), level: "" },
    ]);
    setNewCustomSkillName("");
    setShowAddCustom(false);
    toast.success("Skill added to matrix");
  };

  const removeCustomSkill = (key) => {
    setSkillToRemove(key);
    setDeleteModalOpen(true);
  };

  const confirmRemove = () => {
    if (skillToRemove) {
      setCustomSkills((prev) => prev.filter((s) => s.key !== skillToRemove));
      toast.success("Skill removed from matrix");
      setDeleteModalOpen(false);
      setSkillToRemove(null);
    }
  };



  const startEditLabel = (skill) => {
    setEditingCustomKey(skill.key);
    setEditingLabel(skill.label);
  };

  const saveEditLabel = () => {
    if (!editingLabel.trim()) {
      toast.error("Skill name cannot be empty");
      return;
    }
    setCustomSkills((prev) =>
      prev.map((s) =>
        s.key === editingCustomKey ? { ...s, label: editingLabel.trim() } : s
      )
    );
    setEditingCustomKey(null);
    toast.success("Skill renamed");
  };

  const cancelEditLabel = () => {
    setEditingCustomKey(null);
    setEditingLabel("");
  };

  const allSkills = [...skills, ...customSkills];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="font-semibold text-gray-700">Competency Matrix</span>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddCustom(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
          >
            <PlusIcon className="w-4 h-4" /> Add Skill
          </button>
          <button
            onClick={saveCompetency}
            disabled={saving}
            className="px-4 py-1.5 bg-primary-pink text-white text-sm rounded-md hover:opacity-90 disabled:bg-gray-400"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Add Custom Skill Form */}
      {showAddCustom && (
        <div className="mb-4 flex items-center gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
          <input
            type="text"
            value={newCustomSkillName}
            onChange={(e) => setNewCustomSkillName(e.target.value)}
            placeholder="Skill name (e.g. Adaptability)"
            className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
            onKeyDown={(e) => e.key === "Enter" && addCustomSkill()}
          />
          <button
            onClick={addCustomSkill}
            className="px-3 py-1.5 bg-primary-pink text-white text-sm rounded-md hover:opacity-90"
          >
            Add
          </button>
          <button
            onClick={() => {
              setShowAddCustom(false);
              setNewCustomSkillName("");
            }}
            className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Competency Table */}
      {loading ? (
        <p className="text-center py-4 text-gray-500">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-3 px-2">#</th>
                <th className="pb-3 px-2">Skill</th>
                <th className="pb-3 px-2">Level</th>
                <th className="pb-3 px-2 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {allSkills.map((skill, index) => {
                const isCustom = customSkills.some((s) => s.key === skill.key);
                return (
                  <tr
                    key={skill.key}
                    className="border-b hover:bg-gray-50 transition-colors group"
                  >
                    <td className="py-3 px-2">{index + 1}</td>
                    <td className="py-3 px-2 font-medium text-gray-800">
                      {isCustom && editingCustomKey === skill.key ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingLabel}
                            onChange={(e) => setEditingLabel(e.target.value)}
                            className="border border-gray-300 rounded-md px-2 py-1 text-sm flex-1"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEditLabel();
                              if (e.key === "Escape") cancelEditLabel();
                            }}
                          />
                          <button
                            onClick={saveEditLabel}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEditLabel}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{skill.label}</span>
                          {isCustom && (
                            <button
                              onClick={() => startEditLabel(skill)}
                              className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <PencilIcon className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <select
                        value={skill.level}
                        onChange={(e) =>
                          handleLevelChange(skill.key, e.target.value, isCustom)
                        }
                        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm min-w-[160px]"
                      >
                        <option value="">Select Level</option>
                        {COMPETENCY_LEVELS.map((l) => (
                          <option key={l} value={l}>
                            {l}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-2">
                      {isCustom && (
                        <button
                          onClick={() => removeCustomSkill(skill.key)}
                          title="Remove skill"
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <ConfirmationDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmRemove}
        title="Remove Skill?"
        message="Are you sure you want to remove this skill from the matrix?"
      />
    </div>
  );
};

export default UserCompetencyMatrixTab;
