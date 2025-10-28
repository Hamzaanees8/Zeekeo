import Templates from "../../campaigns/templates/Templates";

const AgencyTemplates = () => {
  let loginAsSessionToken = '';
  const authStorage = JSON.parse(localStorage.getItem("auth-storage") || "{}");
  if (authStorage.state?.loginAsSessionToken) {
    loginAsSessionToken = authStorage.state.loginAsSessionToken;
  }
  console.log('authStorage', authStorage);
  console.log('loginAsSessionToken', loginAsSessionToken);
  return (
    <div className="">
      <Templates />
    </div>
  );
};

export default AgencyTemplates;
