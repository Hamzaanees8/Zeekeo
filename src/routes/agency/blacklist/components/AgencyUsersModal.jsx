import { useState, useEffect } from 'react';
import { StepReview } from '../../../../components/Icons';

function AgencyUsersModal({ agencyUsers, blacklistName, selectedUsers, setSelectedUsers }) {

    const [allUsers, setAllUsers] = useState(agencyUsers)
    const [allSelected, setAllSelected] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");


    useEffect(() => {
        const usersWithBlacklist = agencyUsers?.filter((user) => {
            return user.blacklists && Array.isArray(user.blacklists) && user.blacklists.includes(blacklistName);
        }) || [];

        const userEmails = usersWithBlacklist.map(user => user.email);
        setSelectedUsers(userEmails);
    }, [agencyUsers, blacklistName]);

    useEffect(() => {
        const allUsersSelected = agencyUsers.length > 0 && selectedUsers.length === agencyUsers.length;
        setAllSelected(allUsersSelected);
    }, [selectedUsers, agencyUsers]);

    const handleSelectAll = () => {
        if (allSelected) {
            setSelectedUsers([]);
        } else {
            const allUserIds = agencyUsers.map(user => user.email);
            setSelectedUsers(allUserIds);
        }
    };

    const handleUserSelect = (email) => {
        setSelectedUsers(prev => {
            if (prev.includes(email)) {
                return prev.filter(id => id !== email);
            } else {
                return [...prev, email];
            }
        });
    };

    const handleSearch = e => {
        setSearchTerm(e.target.value);
    };

    useEffect(() => {
        const searchFilteredUser = agencyUsers?.filter((user) => {
            if (searchTerm.trim() !== '') {
                const firstName = user.first_name || '';
                const lastName = user.last_name || '';
                const fullName = `${firstName} ${lastName}`.toLowerCase();
                const email = user.email || '';
                const searchLower = searchTerm.toLowerCase();

                return firstName.toLowerCase().includes(searchLower) ||
                    lastName.toLowerCase().includes(searchLower) ||
                    fullName.includes(searchLower) ||
                    email.toLowerCase().includes(searchLower);
            } else {
                return true;
            }
        })
        setAllUsers(searchFilteredUser)
    }, [searchTerm, agencyUsers])

    return (
        <div className="p-2 ">
            <div>
                <p className=" font-urbanist cursor-pointer my-2  text-[#6D6D6D] font-medium text-base" >Assign blacklist to user</p>
            </div>
            <div className="flex items-center border border-[#323232] bg-white px-3 py-2 relative rounded-[6px] min-w-[200px]">
                <input
                    type="text"
                    placeholder="Search users..."
                    className="outline-none text-sm text-[#7E7E7E] w-full"
                    value={searchTerm}
                    onChange={handleSearch}
                />
                <StepReview className="w-3 h-3 absolute right-2 z-10 fill-[#323232]" />
            </div>
            <div className="flex flex-col my-2">
                <div className="flex items-center gap-x-5 mb-2 text-[#6D6D6D] font-medium text-base">
                    <div
                        className={`w-[16px] h-[16px] border-2 cursor-pointer flex items-center justify-center rounded-[3px] ${allSelected
                            ? 'bg-[#6D6D6D] border-[#6D6D6D]'
                            : 'border-[#6D6D6D]'
                            }`}
                        onClick={handleSelectAll}
                    >
                        {allSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </div>
                    <label className="text-[16px] font-urbanist cursor-pointer" onClick={handleSelectAll}>
                        Select All Users
                    </label>
                </div>
            </div>

            <div className="space-y-2 overflow-y-auto h-[260px]">
                {allUsers?.map(user => (
                    <div key={user.email} className="flex items-center gap-x-5 mb-2 text-[#6D6D6D] font-medium text-base">

                        <div
                            className={`w-[16px] h-[16px] border-2 cursor-pointer flex items-center justify-center rounded-[3px] ${selectedUsers.includes(user.email)
                                ? 'bg-[#6D6D6D] border-[#6D6D6D]'
                                : 'border-[#6D6D6D]'
                                }`}
                            onClick={() => handleUserSelect(user.email)}
                        >
                            {selectedUsers.includes(user.email) && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>

                        <label className="text-[16px] font-urbanist cursor-pointer flex-1">
                            {user.first_name} {user.last_name}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AgencyUsersModal;