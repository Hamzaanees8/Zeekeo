import Table from "./Table";
const headers = ["Template Name"];
const data = [
  {
    template: "Invite Template 1",
  },
  {
    template: "Invite Template 2",
  },
  {
    template: "Invite Template 3",
  },
  {
    template: "Invite Template 4",
  },
  {
    template: "Invite Template 5",
  },
  {
    template: "Invite Template 6",
  },
];
const Invite = () => {
  return (
    <div>
      <Table headers={headers} data={data} rowsPerPage="all" />
    </div>
  );
};

export default Invite;
