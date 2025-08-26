import Table from "../../../components/Table";
const headers = ["#", "Value"];
const data = [{ "#": 1, Value: "7de474a6-6Y6-69-52f-5aea1c1a9c" }];
const APIKeysTab = () => {
  return (
    <div>
      <Table headers={headers} data={data} />
    </div>
  );
};

export default APIKeysTab;
