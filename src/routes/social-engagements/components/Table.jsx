import React, { useState, useEffect, useRef } from "react";
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
import { api } from "../../../services/api.js";

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
  const [postsData, setPostsData] = useState(data);
  const [loadingPosts, setLoadingPosts] = useState(new Set());
  const isFetchingRef = useRef(false);
  console.log("data", data);

  // Fetch metrics for posts in batches of 3
  useEffect(() => {
    const fetchPostMetrics = async () => {
      // Prevent duplicate fetches
      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;
      // Fetch metrics for both posted posts and scheduled posts that may have been posted
      // Skip posts that were created less than 5 minutes ago
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      const postsToFetch = data.filter(post => {
        // Skip posts created less than 5 minutes ago
        if (post.created_at && now - post.created_at < fiveMinutes) {
          return false;
        }

        // Include posted posts with URN
        if (post.status === "posted" && post.linkedin_post_urn) {
          return true;
        }

        // Include scheduled posts that may have been posted
        // (scheduled_at is in the past)
        if (post.status === "scheduled" && post.scheduled_at) {
          return post.scheduled_at < now;
        }

        return false;
      });

      if (postsToFetch.length === 0) {
        isFetchingRef.current = false;
        return;
      }

      // Process in batches of 3
      for (let i = 0; i < postsToFetch.length; i += 3) {
        const batch = postsToFetch.slice(i, i + 3);

        // Mark batch as loading
        setLoadingPosts(prev => {
          const newSet = new Set(prev);
          batch.forEach(post => newSet.add(post.post_id));
          return newSet;
        });

        // Fetch metrics for all posts in the batch concurrently
        const batchPromises = batch.map(async post => {
          try {
            let apiUrl;

            // Handle scheduled posts
            if (post.status === "scheduled") {
              // For scheduled posts, send the text to match
              apiUrl = `/users/posts/retrieve?scheduled=true&post_id=${post.post_id}&text=${encodeURIComponent(post.text)}`;
            } else {
              // Handle regular posted posts with URN
              // Clean the URN to extract only the numeric part
              // Format: urn:li:share:ACTUAL_URN or urn:li:ugcPost:ACTUAL_URN
              let cleanUrn = post.linkedin_post_urn;

              // Check if it's in the format urn:li:share: or urn:li:ugcPost:
              if (cleanUrn.startsWith("urn:li:share:")) {
                cleanUrn = cleanUrn.replace("urn:li:share:", "");
              } else if (cleanUrn.startsWith("urn:li:ugcPost:")) {
                cleanUrn = cleanUrn.replace("urn:li:ugcPost:", "");
              }

              apiUrl = `/users/posts/retrieve?urn=${encodeURIComponent(cleanUrn)}&post_id=${post.post_id}`;
            }

            const response = await api.get(apiUrl);

            // Check if the response has valid metrics data
            if (
              response &&
              (response.impressions_counter !== undefined ||
                response.reaction_counter !== undefined ||
                response.comment_counter !== undefined)
            ) {
              const result = {
                post_id: post.post_id,
                metrics: {
                  impressions_counter: response.impressions_counter,
                  reaction_counter: response.reaction_counter,
                  comment_counter: response.comment_counter,
                },
              };

              // If parsed_datetime is available, include posted_at
              if (response.parsed_datetime) {
                result.posted_at = new Date(response.parsed_datetime).getTime();
              }

              return result;
            } else {
              // No data returned, keep existing database values
              return {
                post_id: post.post_id,
                metrics: null,
              };
            }
          } catch (error) {
            console.error(
              `Error fetching metrics for post ${post.post_id}:`,
              error,
            );
            // On error, keep existing database values
            return {
              post_id: post.post_id,
              metrics: null,
            };
          }
        });

        // Wait for all requests in the batch to complete
        const results = await Promise.all(batchPromises);

        // Update posts data with fetched metrics
        setPostsData(prevData =>
          prevData.map(post => {
            const result = results.find(r => r.post_id === post.post_id);
            // Only update if we got valid metrics back
            if (result && result.metrics) {
              const updates = {
                ...post,
                impressions_counter: result.metrics.impressions_counter,
                reaction_counter: result.metrics.reaction_counter,
                comment_counter: result.metrics.comment_counter,
              };

              // If this was a scheduled post that was found, update status to posted
              if (post.status === "scheduled") {
                updates.status = "posted";
              }

              // Update posted_at if available from the API response
              if (result.posted_at) {
                updates.posted_at = result.posted_at;
              }

              return updates;
            }
            // Keep existing values if no metrics or error occurred
            return post;
          }),
        );

        // Remove batch from loading state
        setLoadingPosts(prev => {
          const newSet = new Set(prev);
          batch.forEach(post => newSet.delete(post.post_id));
          return newSet;
        });

        // Add 1 second delay after each batch (except the last one)
        if (i + 3 < postsToFetch.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Reset the flag after all batches are done
      isFetchingRef.current = false;
    };

    fetchPostMetrics();
  }, [data]);

  // Update postsData when data prop changes
  useEffect(() => {
    setPostsData(data);
  }, [data]);

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
      {postsData.map(row => {
        const isLoading = loadingPosts.has(row.post_id);
        return (
          <React.Fragment key={row.post_id}>
            <tr
              className={`font-normal text-[12px] text-[#454545] font-['Poppins'] ${
                openRow === row.post_id
                  ? "border-b-0"
                  : "border-b border-[#00000020]"
              }`}
            >
              <td className="py-2 max-w-xs">
                <div className="truncate" title={row?.text}>
                  {row?.text}
                </div>
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
              <td className="px-3 py-2 text-center">
                {isLoading ? (
                  <div className="inline-flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  row?.impressions_counter ?? 0
                )}
              </td>
              <td className="px-4 py-2 text-center">
                {isLoading ? (
                  <div className="inline-flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  row?.reaction_counter ?? 0
                )}
              </td>
              <td className="px-4 py-2 text-center">
                {isLoading ? (
                  <div className="inline-flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  row?.comment_counter ?? 0
                )}
              </td>
            <td className="px-4 py-2 text-center">
              <div className="flex justify-center whitespace-nowrap">
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

                  return <p>{formattedDate} {formattedTime}</p>;
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

            <td className="py-2 px-2 w-px whitespace-nowrap">
              <div className="flex items-center justify-end gap-x-2">
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
                        `https://www.linkedin.com/feed/update/urn:li:activity:${row.linkedin_post_urn}`,
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
              </div>
            </td>
            </tr>
          </React.Fragment>
        );
      })}
    </TableWrapper>
  );
};

export default Table;
