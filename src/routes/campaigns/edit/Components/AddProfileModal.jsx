import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import Papa from "papaparse";
import { isValidURL } from "../../../../utils/campaign-helper";
import { createProfilesUrl, updateProfilesUrl } from "../../../../services/campaigns";

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
  const [textareaValue, setTextareaValue] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [validationTimeout, setValidationTimeout] = useState(null);
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
    };
  }, [validationTimeout]);

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
    
    // Clear textarea when CSV is selected
    setTextareaValue("");
    
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

  const handleTextareaChange = e => {
    const value = e.target.value;
    setTextareaValue(value);
    
    // Clear CSV data when user starts typing in textarea
    if (value.trim() !== "" && droppedFile) {
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
    }

    // Clear previous timeout
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }

    // Debounce validation to avoid showing toast on every keystroke
    const timeoutId = setTimeout(() => {
      const urls = value
        .split("\n")
        .map(line => line.trim())
        .filter(line => line !== "");

      if (urls.length > 0) {
        const validUrls = urls.filter(url => isValidURL(url));
        const uniqueValidUrls = [...new Set(validUrls)];
        
        if (uniqueValidUrls.length > 0) {
          toast.success(`${uniqueValidUrls.length} valid URL(s) added`);
        } else {
          toast.error("No valid URLs found in the text");
        }
      }
    }, 800); // Wait 800ms after user stops typing

    setValidationTimeout(timeoutId);
  };

  const handleAddProfiles = async () => {
    // Determine input method: textarea or CSV
    const isTextareaMode = textareaValue.trim() !== "";
    const isCsvMode = droppedFile && csvRows.length > 0;

    if (!isTextareaMode && !isCsvMode) {
      toast.error("Please paste URLs or upload a CSV file");
      return;
    }

    if (isCsvMode && !selectedColumn) {
      toast.error("Please select Profile URL column");
      return;
    }

    if (!campaignId) { 
      toast.error("Campaign ID is missing");
      setIsUploading(false);
      return;
    }

    setIsUploading(true);

    let urls = [];
    let profilesToProcess = [];

    // Process textarea input
    if (isTextareaMode) {
      urls = textareaValue
        .split("\n")
        .map(line => line.trim())
        .filter(line => line !== "" && isValidURL(line));

      if (urls.length === 0) {
        toast.error("No valid URLs found in the text");
        setIsUploading(false);
        return;
      }

      // For textarea, no custom fields, just URLs
      profilesToProcess = urls.map(url => ({
        url: url,
        custom_fields: null,
      }));
    }
    // Process CSV input
    else if (isCsvMode) {
      // Extract URLs from selected column
      urls = csvRows
        .map(row => row[selectedColumn]?.trim())
        .filter(url => url && isValidURL(url));

      if (urls.length === 0) {
        toast.error("No valid URLs found in the selected column");
        setIsUploading(false);
        return;
      }

      // Prepare profiles data with custom fields
      profilesToProcess = csvRows.map(row => {
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
          url: profileUrl,
          custom_fields: Object.keys(customFields).length > 0 ? customFields : null,
        };
      }).filter(Boolean);
    }

    // Filter duplicates within the CSV itself to avoid double processing
    const processedUrls = new Set();
    const uniqueProfilesToProcess = profilesToProcess.filter(profile => {
      if (processedUrls.has(profile.url)) return false;
      processedUrls.add(profile.url);
      return true;
    });

    // Valid existing profiles set
    const existingUrlSet = new Set(existingProfiles?.map(p => p.profile_url) || []);
    
    // Separate into ADD and UPDATE lists
    const profilesToAdd = [];
    const profilesToUpdate = [];

    uniqueProfilesToProcess.forEach(profile => {
      if (existingUrlSet.has(profile.url)) {
        profilesToUpdate.push(profile);
      } else {
        profilesToAdd.push(profile);
      }
    });

    if (profilesToAdd.length === 0 && profilesToUpdate.length === 0) {
      toast.error("No valid profiles to process.");
      setIsUploading(false);
      return;
    }

    console.log(`Processing: ${profilesToAdd.length} to add, ${profilesToUpdate.length} to update`);

    try {
      let addedCount = 0;
      let updatedCount = 0;
      let notFoundCount = 0;
      let failedCount = 0;

      // 1. Add new profiles
      if (profilesToAdd.length > 0) {
        const addResponse = await createProfilesUrl(
          campaignId,
          profilesToAdd.map(profile => ({
            url: profile.url,
            custom_fields: profile.custom_fields
          }))
        );
        if (addResponse.added) {
          addedCount = addResponse.added_count || profilesToAdd.length;
        }
      }

      // 2. Update existing profiles
      if (profilesToUpdate.length > 0) {
        // Map the structure to match what the backend expects: profile_url instead of url
        const updatePayload = profilesToUpdate.map(profile => ({
          profile_url: profile.url,
          custom_fields: profile.custom_fields
        }));

        const updateResponse = await updateProfilesUrl(campaignId, updatePayload);
        
        // Handle both unwrapped and wrapped response formats
        const resp = updateResponse.body || updateResponse;
        
        if (typeof resp.updated === 'number') updatedCount = resp.updated;
        if (typeof resp.not_found === 'number') notFoundCount = resp.not_found;
        if (typeof resp.failed === 'number') failedCount = resp.failed;
      }

      // 3. Feedback and Cleanup
      const parts = [];
      if (addedCount > 0) parts.push(`${addedCount} Added`);
      if (updatedCount > 0) parts.push(`${updatedCount} Updated`);
      if (notFoundCount > 0) parts.push(`${notFoundCount} Not Found`);
      if (failedCount > 0) parts.push(`${failedCount} Failed`);

      if (parts.length > 0) {
        const message = `Success: ${parts.join(", ")}`;
        toast.success(message);
        await onAddProfiles();
        onClose();
      } else if (profilesToUpdate.length > 0 && updatedCount === 0 && notFoundCount === 0 && failedCount === 0) {
        // Handled but no explicit stats returned or all 0
        toast.success("Profiles processed successfully");
        await onAddProfiles();
        onClose();
      } else {
        toast("No changes were made.");
        await onAddProfiles();
        onClose();
      }

    } catch (error) {
      console.error("Error processing profiles:", error);
      toast.error("Error processing profiles. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}>
      <div className="bg-white w-[600px] max-h-[90vh] overflow-y-auto rounded-[8px] p-6 custom-scroll1">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[#04479C] text-[20px] font-semibold font-urbanist">
            Add Profiles
          </h2>
          <button 
            onClick={onClose}
            className="text-[#7E7E7E] text-xl cursor-pointer hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {/* Paste URL Box */}
        <div className="mb-4">
          <textarea
            placeholder="Paste URLs (one per line)"
            className="w-full border border-[#C7C7C7] px-3 py-2 bg-white rounded-[4px] focus:outline-none focus:border-[#0387FF] resize-vertical"
            value={textareaValue}
            onChange={handleTextareaChange}
            rows={6}
          />
        </div>

        <div className="text-[#6D6D6D] font-medium text-center mb-4">Or</div>

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
            disabled={isUploading || (textareaValue.trim() === "" && !selectedColumn)}
            className={`px-4 py-2 text-white cursor-pointer rounded-[4px] transition-colors ${
              isUploading || (textareaValue.trim() === "" && !selectedColumn)
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