const ProfileSettings = ({
  formData,
  onProfileChange,
  handleSaveSettings,
}) => {
  // useEffect(() => {
  //   if (currentUser) {
  //     setFirstName(currentUser?.first_name)
  //     setLastName(currentUser?.last_name)
  //     setEmail(currentUser?.email)
  //     setCompany(currentUser?.company)
  //   }
  // }, [currentUser])
  const handleChange = e => {
    const { name, value } = e.target;
    onProfileChange(name, value);
  };
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 gap-5">
        <div className="flex gap-4 justify-between w-full">
          <div className="flex flex-col w-6/12">
            <label className="text-sm text-[#6D6D6D] mb-1">First Name</label>
            <input
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              type="text"
              placeholder=""
              className="border border-[#6D6D6D] bg-white px-3 py-2 text-sm text-[#6D6D6D]"
            />
          </div>
          <div className="flex flex-col w-6/12">
            <label className="text-sm text-[#6D6D6D] mb-1">Last Name</label>
            <input
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              type="text"
              placeholder=""
              className="border border-[#6D6D6D] bg-white px-3 py-2 text-sm text-[#6D6D6D]"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-[#6D6D6D] mb-1">Email</label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
            placeholder="Email.address@email.com"
            className="border border-[#6D6D6D] bg-white px-3 py-2 text-sm text-[#6D6D6D]"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-[#6D6D6D] mb-1">Company</label>
          <input
            name="company"
            value={formData.company}
            onChange={handleChange}
            type="text"
            placeholder=""
            className="border border-[#6D6D6D] bg-white px-3 py-2 text-sm text-[#6D6D6D]"
          />
        </div>

        <div className="flex gap-4 justify-between w-full">
          <div className="flex flex-col w-6/12">
            <label className="text-sm text-[#6D6D6D] mb-1">New Password</label>
            <input
              name="password"
              value={formData.password}
              onChange={handleChange}
              type="password"
              autoComplete="new-password"
              placeholder=""
              className="border border-[#6D6D6D] bg-white px-3 py-2 text-sm text-[#6D6D6D]"
            />
          </div>
          <div className="flex flex-col w-6/12">
            <label className="text-sm text-[#6D6D6D] mb-1">
              Confirm Password
            </label>
            <input
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              type="password"
              autoComplete="new-password"
              placeholder=""
              className="border border-[#6D6D6D] bg-white px-3 py-2 text-sm text-[#6D6D6D]"
            />
          </div>
        </div>

        <div />

        <button
          onClick={handleSaveSettings}
          className="bg-[#0387FF] text-white px-5 py-2 text-[16px] cursor-pointer w-fit justify-self-end"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings;
