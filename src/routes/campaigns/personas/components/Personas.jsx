import React, { useEffect, useRef, useState } from "react";
import {
  DeleteIcon,
  CopyIcon,
  PencilIcon,
  StepReview,
  PlusIcon,
  DownloadIcon,
  FilterIcon,
  DropArrowIcon,
} from "../../../../components/Icons.jsx";
import PersonaForm from "./PersonaForm.jsx";
import PersonaPopup from "./PersonaPopup.jsx";
import {
  createPersona,
  deletePersona,
  deletePersonas,
  getPersonas,
} from "../../../../services/personas.js";
import toast from "react-hot-toast";

export const Personas = () => {
  const [search, setSearch] = useState("");
  const [expandedPersona, setExpandedPersona] = useState(null);
  const [showOnlyGenerated, setShowOnlyGenerated] = useState(false);
  const [creatingNew, setCreatingNew] = useState(false);
  const [editingPersonaId, setEditingPersonaId] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [personaIdToDelete, setPersonaIdToDelete] = useState(null);
  const [selectMultiple, setSelectMultiple] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState("all");
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showClonePopup, setShowClonePopup] = useState(false);
  const [personaToClone, setPersonaToClone] = useState(null);

  const moreOptionsRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreOptionsRef.current && !moreOptionsRef.current.contains(e.target)) {
        setShowMoreOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyPersona = async persona => {
    const newName = `${persona.name} Copy`;
    const { created_at, updated_at, user_email, persona_id, ...rest } =
      persona;

    const copiedPersona = {
      ...rest,
      name: newName,
    };
    try {
      const createdPersona = await createPersona(copiedPersona);
      setPersonas(prev => [...prev, createdPersona]);
      toast.success("Persona Copied Successfully");
    } catch (err) {
      if (err?.response?.status !== 401) {
        toast.error("Failed to copy persona:", err);
      }
    }
  };

  const filteredPersonas = personas?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCheckboxChange = id => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id],
    );
  };

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const data = await getPersonas();
        setPersonas(data);
      } catch (err) {
        setError("Failed to load personas");
        console.error(err);
      }
    };

    fetchPersonas();
  }, []);
  console.log("personas", personas);

  return (
    <div className="p-6 w-full pt-[64px] bg-[#EFEFEF]">
      <div className="flex justify-between">
        <h1 className="text-[48px] font-urbanist text-[#6D6D6D] font-medium mb-6">
          Personas
        </h1>
        <div className="flex items-center gap-x-2">
            <div className="relative w-[225px] h-[40px]">
              <span className="absolute right-2 top-1/2 -translate-y-1/2">
                <StepReview className="w-4 h-4 fill-[#7E7E7E]" />
              </span>
              <input
                type="text"
                placeholder="Search"
                onChange={e => setSearch(e.target.value)}
                className="w-full border border-[#7E7E7E] text-base h-[40px] rounded-[6px] text-[#7E7E7E] font-medium pl-3 pr-3 bg-white focus:outline-none"
              />
            </div>
            <button className="w-10 h-10 border rounded-full flex items-center justify-center bg-white !p-0 cursor-pointer">
              <DownloadIcon className="w-5 h-5 text-[#4D4D4D]" />
            </button>
            <button className="w-10 h-10 border border-grey-400 rounded-full flex items-center cursor-pointer justify-center bg-white">
              <FilterIcon className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div className="w-[60%] justify-self-center">
        <div className="min-h-[400px]">
          {/* Top bar */}
          <div className="flex items-center gap-2 mb-6 justify-between">
            {/* <div className="relative w-[68%]">
              <span className="absolute left-2 top-1/2 -translate-y-1/2">
                <StepReview className="w-4 h-4 fill-[#7E7E7E]" />
              </span>
              <input
                type="text"
                placeholder="Search"
                className="w-full border border-[#7E7E7E] pl-8 pr-3 py-1 text-urbanist text-[#6D6D6D] bg-white focus:outline-none rounded-[4px]"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div> */}

            <div className=" flex">
              <div className="relative h-[36px]" ref={moreOptionsRef}>
                <div
                  className="cursor-pointer h-[36px] w-[120px] justify-between border border-[#7E7E7E] px-3 py-1 text-sm font-normal bg-white text-[#7E7E7E] flex items-center gap-x-2 rounded-[6px]"
                  onClick={() => setShowMoreOptions(prev => !prev)}
                >
                  <span>{rowsPerPage === "all" ? "Show All" : `Show ${rowsPerPage}`}</span>
                  <DropArrowIcon className="h-[14px] w-[12px]" />
                </div>
                {showMoreOptions && (
                  <div className="absolute overflow-hidden top-[40px] left-0 w-[120px] bg-white border border-[#7E7E7E] z-50 shadow-md text-[#7E7E7E] text-sm rounded-[6px]">
                    {["all", 20, 50].map(val => (
                      <div
                        key={val}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setRowsPerPage(val);
                          setShowMoreOptions(false);
                        }}
                      >
                        {val === "all" ? "Show All" : `Show ${val}`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              className="px-1 py-1 text-urbanist w-[180px] rounded-[4px] font-medium bg-[#0387FF] text-[#ffffff]  cursor-pointer"
              onClick={() => {
                setExpandedPersona("new");
                setCreatingNew(true);
                setEditingPersonaId(null);
              }}
            >
              + Create Persona
            </button>

            {/* <span
              onClick={() => {
                setSelectMultiple(!selectMultiple);
                if (selectMultiple) setSelectedItems([]);
              }}
            >
              <DeleteIcon className="w-8 h-8 p-[2px] border border-[#D80039] cursor-pointer rounded-[4px]" />
            </span> */}
          </div>

          {/* New Persona */}
          {creatingNew && expandedPersona === "new" && (
            <div className="border-t border-[#7E7E7E] py-2">
              <div className="flex justify-between items-center">
                <span className="text-[#6D6D6D] text-sm font-normal">
                  New Persona
                </span>
              </div>
              <div className="mt-3 text-sm text-[#6D6D6D]">
                <PersonaForm
                  setPersonas={setPersonas}
                  isNew
                  onCancel={() => {
                    setCreatingNew(false);
                    setExpandedPersona(null);
                  }}
                />
              </div>
            </div>
          )}
          {!creatingNew && (
            <div className="bg-white border border-[#7E7E7E] rounded-[8px] shadow-md overflow-hidden">
              <div className="flex justify-between items-center px-3 py-2 border-b border-[#CCCCCC]">
                <div className="flex items-center gap-3 w-1/3">
                  <span className="text-[#6D6D6D] text-sm font-normal"></span>
                  <span className="text-[#6D6D6D] text-sm font-normal">Persona Title</span>
                </div>
                <div className="w-1/3"></div> {/* spacer for alignment */}
                <div className="text-[#6D6D6D] text-sm font-normal w-1/3 text-right">
                  Action
                </div>
              </div>
              {(rowsPerPage === "all" 
                  ? filteredPersonas 
                  : filteredPersonas.slice(0, rowsPerPage)
                )?.map((persona, index) => (
                <div
                  key={persona.persona_id}
                  className="border-b border-[#CCCCCC] py-3"
                >
                  <div className="flex justify-between items-center px-3">
                    <div className="flex items-center gap-3 w-1/3">
                      <span className="text-[#6D6D6D] text-sm font-medium">{index + 1}</span>
                      <span className="text-[#0387FF] text-sm">{persona.name}</span>
                    </div>
                    <div className="w-1/3"></div> {/* spacer for alignment */}
                    <div className="flex gap-2 w-1/3 justify-end">
                      <span
                        onClick={() => {
                          setExpandedPersona("new");
                          setCreatingNew(true);
                          setEditingPersonaId(null);
                        }}
                      >
                        <PlusIcon className="w-5 h-5 p-[2px] rounded-full border border-[#0387FF] fill-[#0387FF] cursor-pointer" />
                      </span>
                      <span
                        onClick={() => {
                          setExpandedPersona(persona.persona_id);
                          setShowOnlyGenerated(false);
                          setEditingPersonaId(persona.persona_id);
                          setCreatingNew(false);
                        }}
                      >
                        <PencilIcon className="w-5 h-5 p-[2px] rounded-full border border-[#12D7A8] fill-[#12D7A8] cursor-pointer" />
                      </span>
                      <span 
                      onClick={() => {
                        setPersonaToClone(persona);
                        setShowClonePopup(true);
                      }}>
                        <CopyIcon className="w-5 h-5 p-[2px] rounded-full border border-[#00B4D8] fill-[#00B4D8] cursor-pointer" />
                      </span>
                      <span
                        onClick={() => {
                          setShowDeletePopup(true);
                          setPersonaIdToDelete(persona.persona_id);
                        }}
                      >
                        <DeleteIcon className="w-5 h-5 p-[2px] rounded-full border border-[#D80039] cursor-pointer" />
                      </span>
                    </div>
                  </div>

                  {/* Form for selected persona */}
                  {expandedPersona === persona.persona_id && (
                    <div className="mt-3 text-sm text-[#6D6D6D]">
                      <PersonaForm
                        setPersonas={setPersonas}
                        id={editingPersonaId}
                        isEdit={editingPersonaId === persona.persona_id}
                        showOnlyGenerated={showOnlyGenerated}
                        onCancel={() => {
                          setExpandedPersona(null);
                          setEditingPersonaId(null);
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {/* Single Delete Popup */}
          {showDeletePopup && !selectMultiple && (
            <PersonaPopup
            title="Delete Item"
              message="Are you sure you would like delete this item? This action cannot be undone."
              confirmText="Delete"
              onClose={() => {
                setShowDeletePopup(false);
                setPersonaIdToDelete(null);
              }}
              onConfirm={async () => {
                if (personaIdToDelete !== null) {
                  try {
                    await deletePersona(personaIdToDelete);
                    const updatedData = await getPersonas();
                    setPersonas(updatedData);
                    toast.success("Persona deleted successfully");
                    setShowDeletePopup(false);
                    setShowDeletePopup(false);
                    setPersonaIdToDelete(null);
                  } catch (err) {
                    console.log("error", err);
                    if (err?.response?.status !== 401) {
                      toast.error("Error deleting persona:", err);
                    }
                  } finally {
                    setShowDeletePopup(false);
                    setPersonaIdToDelete(null);
                  }
                }
              }}
            />
          )}
          {showClonePopup && (
            <PersonaPopup
              title="Clone Persona?"
              message="Would like clone this persona to a new draft?"
              confirmText="Clone"
              onClose={() => {
                setShowClonePopup(false);
                setPersonaToClone(null);
              }}
              onConfirm={async () => {
                if (personaToClone) {
                  await handleCopyPersona(personaToClone);
                  setShowClonePopup(false);
                  setPersonaToClone(null);
                }
              }}
            />
          )}
        </div>
        {/* Footer for multi-delete */}
        {selectMultiple && selectedItems.length > 0 && (
          <div className="flex justify-between items-center mt-6 ">
            <button
              className="px-4 py-1 bg-[#7E7E7E] text-white text-sm rounded-[4px]"
              onClick={() => {
                setSelectMultiple(false);
                setSelectedItems([]);
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-1 bg-[#D80039] text-white text-sm rounded-[4px]"
              onClick={() => setShowDeletePopup(true)}
            >
              Delete Selected
            </button>

            {showDeletePopup && selectMultiple && (
              <PersonaPopup
                message={`Are you sure you want to delete ${selectedItems.length} personas? This action cannot be undone.`}
                onClose={() => setShowDeletePopup(false)}
                onConfirm={async () => {
                  try {
                    await deletePersonas(selectedItems);
                    const updatedData = await getPersonas();
                    setPersonas(updatedData);
                    toast.success("Personas deleted successfully");
                    setShowDeletePopup(false);
                    setSelectMultiple(false);
                    setSelectedItems([]);
                  } catch (err) {
                    if (err?.response?.status !== 401) {
                      toast.error("Error deleting multiple personas:", err);
                    }
                  } finally {
                    setShowDeletePopup(false);
                  }
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Personas;
