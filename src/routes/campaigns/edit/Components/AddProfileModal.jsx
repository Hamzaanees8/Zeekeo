import React, { useState, useRef } from "react";
import toast from "react-hot-toast";
import Papa from "papaparse";
import { isValidURL } from "../../../../utils/campaign-helper";
import { createProfilesUrl } from "../../../../services/campaigns";

const AddProfileModal = ({ onClose, onAddProfiles, campaignId, existingProfiles = [] }) => {
  const [droppedFile, setDroppedFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [selectedCustomColumns, setSelectedCustomColumns] = useState({
    custom1: "",
    custom2: "",
    custom3: "",
  });
  const [csvRows, setCsvRows] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrop = e => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(e);
    }
  };

  const handleDragOver = e => {
    e.preventDefault();
  };

  const handleFileSelect = e => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    if (
      selectedFile.type !== "text/csv" &&
      !selectedFile.name.endsWith(".csv")
    ) {
      toast.error("Only CSV files are allowed.");
      return;
    }
    
    setSelectedColumn("");
    setSelectedCustomColumns({
      custom1: "",
      custom2: "",
      custom3: "",
    });
    
    processCSVFile(selectedFile);
  };

  const processCSVFile = file => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        const parsedData = results.data;
        if (parsedData.length === 0) {
          toast.error("CSV file is empty or invalid.");
          return;
        }
        setDroppedFile(file);

        const columnNames = Object.keys(parsedData[0]);
        setColumns(columnNames);
        setCsvRows(parsedData);
      },
      error: err => {
        toast.error("Error reading CSV file.");
        console.error(err);
      },
    });
  };

  const removeFile = () => {
    setDroppedFile(null);
    setColumns([]);
    setSelectedColumn("");
    setSelectedCustomColumns({
      custom1: "",
      custom2: "",
      custom3: "",
    });
    setCsvRows([]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
    toast.success("File removed successfully");
  };

  const handleColumnSelect = e => {
    const column = e.target.value;
    setSelectedColumn(column);
  };

  const handleCustomColumnSelect = (fieldName, column) => {
    setSelectedCustomColumns(prev => ({
      ...prev,
      [fieldName]: column,
    }));
  };

  const handleAddProfiles = async () => {
    if (!selectedColumn) {
      toast.error("Please select Profile URL column");
      return;
    }

    if (!campaignId) { 
      toast.error("Campaign ID is missing");
      setIsUploading(false);
      return;
    }

    if (!csvRows.length) {
      toast.error("No CSV data to process");
      return;
    }

    setIsUploading(true);

    // Extract URLs from selected column
    const urls = csvRows
      .map(row => row[selectedColumn]?.trim())
      .filter(url => url && isValidURL(url));

    if (urls.length === 0) {
      toast.error("No valid URLs found in the selected column");
      setIsUploading(false);
      return;
    }

    // Prepare profiles data
    const profilesToAdd = csvRows.map(row => {
      const profileUrl = row[selectedColumn]?.trim();
      if (!profileUrl || !isValidURL(profileUrl)) return null;

      const customFields = {};
      
      if (selectedCustomColumns.custom1 && row[selectedCustomColumns.custom1]?.trim()) {
        customFields["0"] = row[selectedCustomColumns.custom1].trim();
      }
      if (selectedCustomColumns.custom2 && row[selectedCustomColumns.custom2]?.trim()) {
        customFields["1"] = row[selectedCustomColumns.custom2].trim();
      }
      if (selectedCustomColumns.custom3 && row[selectedCustomColumns.custom3]?.trim()) {
        customFields["2"] = row[selectedCustomColumns.custom3].trim();
      }

      return {
        // campaign_id: "new-campaign-id",
        url: profileUrl,
        // created_at: Date.now(),
        custom_fields: Object.keys(customFields).length > 0 ? customFields : null,
        // status: "pending",
        // ttl: Date.now() + 7776000000, // 90 days
        // updated_at: Date.now(),
        // user_email: "user@example.com"
      };
    }).filter(Boolean);

    // Filter out duplicates
    const existingUrlSet = new Set(existingProfiles?.map(p => p.profile_url) || []);
    
    const uniqueProfilesToAdd = profilesToAdd.filter(profile => !existingUrlSet.has(profile.url));

    if (uniqueProfilesToAdd.length === 0) {
      toast.error("All profiles in this CSV already exist.");
      setIsUploading(false);
      return;
    }
    
    if (uniqueProfilesToAdd.length < profilesToAdd.length) {
         toast(`${profilesToAdd.length - uniqueProfilesToAdd.length} duplicate profiles skipped.`);
    }

    console.log("Profiles to add:", uniqueProfilesToAdd);
    // Simulate API call delay
    try {
      // Call the API to add profiles
      const response = await createProfilesUrl(
        campaignId,
        uniqueProfilesToAdd.map(profile => ({
          url: profile.url,
          custom_fields: profile.custom_fields
        }))
      );

      if (response.added) {
        toast.success(`Successfully added ${response.added_count} profiles`);
        
        // Call parent callback to refetch profiles
        await onAddProfiles();
        
        onClose();
      } else {
        toast.error("Failed to add profiles");
      }
    } catch (error) {
      console.error("Error adding profiles:", error);
      toast.error("Error adding profiles. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}>
      <div className="bg-white w-[600px] max-h-[90vh] overflow-y-auto rounded-[8px] p-6 custom-scroll1">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
            Add Profiles from CSV
          </h2>
          <button 
            onClick={onClose}
            className="text-[#7E7E7E] text-xl cursor-pointer hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {/* Dropzone */}
        <div className="mb-6">
          <div
            onDragOver={handleDragOver}
            className="w-full bg-[#D9EFFF] rounded-[4px] border border-dashed border-[#0387FF] flex flex-col items-center justify-center py-12 px-6 space-y-4"
          >
            <div className="text-[#6D6D6D] text-lg">Drop CSV File Here</div>
            <label className="bg-white border border-[#C7C7C7] px-4 py-2 text-[#6D6D6D] cursor-pointer rounded-[4px] hover:bg-gray-50 transition-colors">
              Select CSV File
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                ref={fileInputRef}
                accept=".csv"
              />
            </label>
            <p className="text-sm text-gray-500">Only .csv files are supported</p>

            {droppedFile && (
              <div className="mt-4 w-full">
                <div className="flex justify-between items-center bg-white px-3 py-2 border border-[#C7C7C7] rounded">
                  <span className="truncate text-sm">{droppedFile.name}</span>
                  <button
                    onClick={removeFile}
                    className="ml-2 text-[#D80039] text-sm font-bold hover:text-red-700"
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {csvRows.length} rows loaded
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Column Selection Section */}
        {columns.length > 0 && (
          <div className="space-y-4 mb-6">
            <h3 className="text-[#6D6D6D] font-medium mb-3">
              Map CSV Columns
            </h3>
            
            {/* Profile URL Selection */}
            <div className="flex items-center justify-between gap-4">
              <label className="text-[#6D6D6D] text-sm min-w-[120px]">
                Profile URL *
              </label>
              <select
                value={selectedColumn}
                onChange={handleColumnSelect}
                className="flex-1 border border-[#C7C7C7] px-3 py-2 bg-white text-sm rounded focus:outline-none "
              >
                <option value="">Select Profile URL Column</option>
                {columns.map((col, idx) => (
                  <option key={idx} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Field 1 Selection */}
            <div className="flex items-center justify-between gap-4">
              <label className="text-[#6D6D6D] text-sm min-w-[120px]">
                Custom Field 1
              </label>
              <select
                value={selectedCustomColumns.custom1}
                onChange={e => handleCustomColumnSelect("custom1", e.target.value)}
                className="flex-1 border border-[#C7C7C7] px-3 py-2 bg-white text-sm rounded focus:outline-none "
              >
                <option value="">Optional</option>
                {columns.map((col, idx) => (
                  <option key={`custom1-${idx}`} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Field 2 Selection */}
            <div className="flex items-center justify-between gap-4">
              <label className="text-[#6D6D6D] text-sm min-w-[120px]">
                Custom Field 2
              </label>
              <select
                value={selectedCustomColumns.custom2}
                onChange={e => handleCustomColumnSelect("custom2", e.target.value)}
                className="flex-1 border border-[#C7C7C7] px-3 py-2 bg-white text-sm rounded focus:outline-none "
              >
                <option value="">Optional</option>
                {columns.map((col, idx) => (
                  <option key={`custom2-${idx}`} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Field 3 Selection */}
            <div className="flex items-center justify-between gap-4">
              <label className="text-[#6D6D6D] text-sm min-w-[120px]">
                Custom Field 3
              </label>
              <select
                value={selectedCustomColumns.custom3}
                onChange={e => handleCustomColumnSelect("custom3", e.target.value)}
                className="flex-1 border border-[#C7C7C7] px-3 py-2 bg-white text-sm rounded focus:outline-none "
              >
                <option value="">Optional</option>
                {columns.map((col, idx) => (
                  <option key={`custom3-${idx}`} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[#7E7E7E] border border-[#7E7E7E] bg-white cursor-pointer rounded-[4px] hover:bg-gray-50 transition-colors"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            onClick={handleAddProfiles}
            disabled={isUploading || !selectedColumn}
            className={`px-4 py-2 text-white cursor-pointer rounded-[4px] transition-colors ${
              isUploading || !selectedColumn
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#0387FF] hover:bg-blue-600"
            }`}
          >
            {isUploading ? (
              <>
                <span className="inline-block animate-spin mr-2">⟳</span>
                Adding...
              </>
            ) : (
              "Add Profiles"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProfileModal;