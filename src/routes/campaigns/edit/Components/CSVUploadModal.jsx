import { useState, useRef, useEffect } from "react";
import { Cross, DropArrowIcon } from "../../../../components/Icons";
import Button from "../../../../components/Button";
import toast from "react-hot-toast";

const FIELDS = [
  { key: 'profile_id', label: 'Profile ID', required: true },
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'email_address', label: 'Email' },
  { key: 'website', label: 'Website' },
  { key: 'title', label: 'Title' },
  { key: 'company', label: 'Company' },
  { key: 'custom_field_1', label: 'Custom Field 1' },
  { key: 'custom_field_2', label: 'Custom Field 2' },
  { key: 'custom_field_3', label: 'Custom Field 3' },
];

const CustomSelect = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || { value: "", label: "Do not import" };
  const displayLabel = selectedOption.label || selectedOption.value || "Do not import";

  return (
    <div className="relative" ref={ref}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer flex items-center justify-between text-sm"
      >
        <span className={selectedOption.value === "" ? "text-red-500" : "text-[#6D6D6D]"}>
          {displayLabel}
        </span>
        <DropArrowIcon className="w-3 h-3 text-gray-400" />
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                option.value === "" ? "text-red-500" : "text-[#6D6D6D]"
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label || option.value || "Do not import"}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CSVUploadModal = ({ onClose, onConfirm }) => {
  const [step, setStep] = useState('upload'); // 'upload' | 'mapping'
  const [file, setFile] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);
    
    // Read headers
    const text = await selectedFile.text();
    const firstLine = text.split('\n')[0];
    if (!firstLine) {
      toast.error('Empty CSV file');
      return;
    }

    // Simple CSV header parsing (handling quotes)
    const headers = [];
    let current = '';
    let inQuotes = false;
    for (let char of firstLine) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        headers.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    headers.push(current.trim().replace(/^"|"$/g, ''));

    setCsvHeaders(headers);
    
    // Auto-map
    const newMapping = {};
    FIELDS.forEach(field => {
      const match = headers.find(h => h.toLowerCase() === field.label.toLowerCase());
      if (match) {
        newMapping[field.key] = match;
      } else {
        newMapping[field.key] = ''; // Default to empty (Do not import)
      }
    });
    setMapping(newMapping);
    setStep('mapping');
  };

  const handleMappingChange = (fieldKey, value) => {
    setMapping(prev => ({ ...prev, [fieldKey]: value }));
  };

  const handleConfirm = () => {
    // Validate required fields
    if (!mapping['profile_id']) {
      toast.error('Profile ID mapping is required');
      return;
    }
    setStep('confirmation');
  };

  const handleFinalConfirm = () => {
    onConfirm(file, mapping);
  };

  const getOptions = () => {
    return [
      { value: "", label: "Do not import" },
      ...csvHeaders.map(header => ({ value: header, label: header }))
    ];
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: "rgba(69, 69, 69, 0.4)" }}
    >
      <div className="bg-white rounded-lg shadow-xl w-[600px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-[#0387FF]">
            {step === 'upload' ? 'Upload CSV' : step === 'mapping' ? 'Map Columns' : 'Confirm Update'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 cursor-pointer">
            <Cross className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 'upload' ? (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <div className="mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="mb-4 text-sm text-[#6D6D6D]">
                Upload a CSV file to update profiles
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#0387FF] text-white px-6 py-2 rounded-md hover:bg-[#026ecf] cursor-pointer"
              >
                Browse File
              </Button>
            </div>
          ) : step === 'mapping' ? (
            <div className="space-y-4">
              <p className="text-sm text-[#6D6D6D] mb-4">
                Map the columns from your CSV file to the profile fields.
              </p>
              <div className="grid gap-4">
                {FIELDS.map(field => (
                  <div key={field.key} className="grid grid-cols-2 gap-4 items-center">
                    <label className={`text-sm font-medium ${!mapping[field.key] ? 'text-red-500' : 'text-[#6D6D6D]'}`}>
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <CustomSelect
                      value={mapping[field.key]}
                      onChange={(value) => handleMappingChange(field.key, value)}
                      options={getOptions()}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-2">
              <div className="mb-2 text-center">
                <h4 className="text-lg font-medium text-gray-900 mb-1">Are you sure?</h4>
                <p className="text-sm text-gray-500">
                  This will update existing profiles with data from your CSV file.
                  Only changed fields will be updated.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={step === 'confirmation' ? () => setStep('mapping') : onClose}
            className="px-4 py-2 cursor-pointer text-sm font-medium text-[#6D6D6D] bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {step === 'confirmation' ? 'Back' : 'Cancel'}
          </button>
          {step === 'mapping' && (
            <button
              onClick={handleConfirm}
              className="px-4 py-2 cursor-pointer text-sm font-medium text-white bg-[#0387FF] rounded-md hover:bg-[#026ecf]"
            >
              Update Profiles
            </button>
          )}
          {step === 'confirmation' && (
            <button
              onClick={handleFinalConfirm}
              className="px-4 py-2 cursor-pointer text-sm font-medium text-white bg-[#0387FF] rounded-md hover:bg-[#026ecf]"
            >
              Confirm Update
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSVUploadModal;
