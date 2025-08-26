import Table from "../../../components/Table";
const headers = ["General Stats"];
const data = [];
const StatsTab = () => {
  return (
    <div>
      <Table headers={headers} data={data} />
    </div>
  );
};

export default StatsTab;
