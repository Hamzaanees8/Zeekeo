import React, { useState } from "react";
import {
  Celebration,
  Calender,
  PostAdd,
  Poll,
  Person,
  HandShake,
  CircleAdd,
  CircleExit,
  CircleFile,
  CircleDelete,
} from "../../../components/Icons.jsx";
import TableWrapper from "./TableWrapper.jsx";

const initialData = [
  {
    id: 1,
    title: "Calgary - Admins",
    type: Celebration,
    comment_permission: "All",
    views: 213,
    likes: 12,
    comments: 45,
    posted_date: "2025-07-08",
    posted_time: "07:02",
    status: "posted",
  },
  {
    id: 2,
    title: "Calgary - Admins",
    type: Calender,
    comment_permission: "All",
    views: 146,
    likes: 15,
    comments: 50,
    posted_date: "2025-07-08",
    posted_time: "07:02",
    status: "draft",
  },
  {
    id: 3,
    title: "Calgary - Admins",
    type: PostAdd,
    comment_permission: "All",
    views: 487,
    likes: 18,
    comments: 60,
    posted_date: "2025-07-08",
    posted_time: "07:02",
    status: "posted",
  },
  {
    id: 4,
    title: "Calgary - Admins",
    type: Poll,
    comment_permission: "All",
    views: 521,
    likes: 25,
    comments: 55,
    posted_date: "2025-07-08",
    posted_time: "07:02",
    status: "posted",
  },
  {
    id: 5,
    title: "Calgary - Admins",
    type: Person,
    comment_permission: "All",
    views: 487,
    likes: 18,
    comments: 60,
    posted_date: "2025-07-08",
    posted_time: "07:02",
    status: "posted",
  },
  {
    id: 6,
    title: "Calgary - Admins",
    type: HandShake,
    comment_permission: "All",
    views: 521,
    likes: 25,
    comments: 55,
    posted_date: "2025-07-08",
    posted_time: "07:02",
    status: "posted",
  },
];

const Table = ({ open, data, setPostId, handleDeleteEngagement }) => {
  const [openRow, setOpenRow] = useState(null);
  console.log("data", data);

  return (
    <TableWrapper
      headers={[
        "Text",
        "Type",
        "Visibility",
        "Who Can Comment",
        "Views",
        "Likes",
        "Comments",
        "Post Date",
        "Status",
        "Actions",
      ]}
      className="font-normal text-[15px] text-[#6D6D6D] !pb-[19px] font-['Poppins']"
    >
      {data.map(row => (
        <React.Fragment key={row.post_id}>
          <tr
            className={`font-normal text-[12px] text-[#454545] font-['Poppins'] ${
              openRow === row.post_id
                ? "border-b-0"
                : "border-b border-[#00000020]"
            }`}
          >
            <td className=" py-2" title={row?.text}>
              {row?.text?.length > 50
                ? `${row.text.substring(0, 50)}...`
                : row?.text}
            </td>
            <td className="px-6 py-2 text-center align-middle">Post</td>

            <td className="px-4 py-2 text-center">
              {row?.visibility === "ANYONE"
                ? "Anyone"
                : row?.visibility === "CONNECTIONS_ONLY"
                ? "Connections"
                : row?.visibility || "N/A"}
            </td>

            <td className="px-4 py-2 text-center">
              {row?.allowed_commenters_scope === "ALL"
                ? "All"
                : row?.allowed_commenters_scope === "CONNECTIONS_ONLY"
                ? "Connections"
                : row?.allowed_commenters_scope === "NONE"
                ? "None"
                : row?.allowed_commenters_scope || "N/A"}
            </td>
            <td className="px-3 py-2 text-center">{row?.views || 0}</td>
            <td className="px-4 py-2 text-center">{row?.likes || 0}</td>
            <td className="px-4 py-2 text-center">{row?.comments || 0}</td>
            <td className="px-4 py-2 text-center">
              <div className="flex flex-col justify-center">
                {(() => {
                  const timestamp =
                    row.status === "scheduled"
                      ? row.scheduled_at
                      : row.posted_at;
                  if (!timestamp) return <p>N/A</p>;

                  const date = new Date(timestamp);
                  const formattedDate = date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  });
                  const formattedTime = date.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });

                  return (
                    <>
                      <p>{formattedDate}</p>
                      <p>{formattedTime}</p>
                    </>
                  );
                })()}
              </div>
            </td>
            <td className="px-2 py-2 text-center align-middle">
              <button
                className={`text-xs px-2 w-[80px] py-1 text-white ${
                  row.status === "posted"
                    ? "bg-[#25C396]"
                    : row.status === "scheduled"
                    ? "bg-[#F59E0B]"
                    : "bg-[#0077B6]"
                }`}
              >
                {row.status === "posted"
                  ? "Posted"
                  : row.status === "scheduled"
                  ? "Scheduled"
                  : "Draft"}
              </button>
            </td>

            <td className="py-2 flex items-center justify-between">
              <div
                className="cursor-pointer"
                onClick={() => {
                  open();
                  setPostId(row.post_id);
                }}
              >
                <CircleAdd className="w-[30px] h-[30px]" />
              </div>
              <div
                className="cursor-pointer"
                onClick={() => {
                  if (row.linkedin_post_urn) {
                    window.open(
                      `https://www.linkedin.com/feed/update/${row.linkedin_post_urn}`,
                      "_blank",
                    );
                  }
                }}
              >
                <CircleExit className="w-[30px] h-[30px]" />
              </div>
              <div className="cursor-pointer">
                <CircleFile className="w-[30px] h-[30px]" />
              </div>
              <div
                className="cursor-pointer"
                onClick={() => {
                  handleDeleteEngagement(row.post_id);
                }}
              >
                <CircleDelete className="w-[30px] h-[30px]" />
              </div>
            </td>
          </tr>
        </React.Fragment>
      ))}
    </TableWrapper>
  );
};

export default Table;
