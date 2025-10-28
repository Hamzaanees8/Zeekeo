import React, { useEffect, useState } from "react";
import { getSalesforceContacts } from "../../../services/integrations";

export default function SalesforceExistingContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextAfter, setNextAfter] = useState(null);
  const [nowPageLoading, setNowPageLoading] = useState(false);

  const fetchContacts = async (after = null, append = false) => {
    try {
      setLoading(!append);
      setNowPageLoading(append);

      const data = await getSalesforceContacts();

      if (data.success) {
        setContacts(prev => (append ? [...prev, ...data.contacts] : data.contacts));
        setNextAfter(data.after || null);
      }
    } catch (err) {
      console.error("Error loading contacts", err);
    } finally {
      setLoading(false);
      setNowPageLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

    return (
    <div className="card card-custom shadow-md rounded-xl border border-gray-200 p-4 bg-white">
      <div className="card-body">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <i className="fas fa-spinner fa-spin text-2xl text-gray-600"></i>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border border-gray-200 rounded-md">
              <thead className="bg-gray-50 text-gray-700 text-sm">
                <tr>
                  <th className="p-2 text-center w-[30px]"></th>
                  <th className="p-2 w-[40px] text-center">
                    <input type="checkbox" />
                  </th>
                  <th className="p-2 text-center w-[100px]">Assigned?</th>
                  <th className="p-2 text-center w-[100px]">LinkedIn</th>
                  <th className="p-2 text-left">First Name</th>
                  <th className="p-2 text-left">Last Name</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Title</th>
                  <th className="p-2 text-left">Company</th>
                </tr>
              </thead>
              <tbody>
                {contacts.length > 0 ? (
                  contacts.map((c, i) => (
                    <tr key={c.id || i} className="hover:bg-gray-50 text-sm border-t">
                      <td></td>
                      <td className="text-center">
                        <input type="checkbox" />
                      </td>
                      <td className="text-center">
                        {c.z2_campaigns_id ? (
                          <span className="text-green-600 font-medium">Yes</span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="text-center">
                        {c.linkedin_profile ? (
                          <a
                            href={c.linkedin_profile}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 underline"
                          >
                            Profile
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-2">{c.first_name || "-"}</td>
                      <td className="p-2">{c.last_name || "-"}</td>
                      <td className="p-2">{c.email || "-"}</td>
                      <td className="p-2">{c.title || "-"}</td>
                      <td className="p-2">{c.company || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center py-4 text-gray-500">
                      No contacts found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Load more */}
            {contacts.length > 0 && (
              <div className="flex justify-center py-4">
                {nowPageLoading ? (
                  <i className="fas fa-spinner fa-spin text-gray-600"></i>
                ) : nextAfter ? (
                  <button
                    onClick={() => fetchContacts(nextAfter, true)}
                    className="btn btn-primary"
                  >
                    Load More Contacts
                  </button>
                ) : (
                  <span className="text-gray-400 text-sm">All contacts loaded</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}