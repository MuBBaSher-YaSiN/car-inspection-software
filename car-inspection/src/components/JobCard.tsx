// @ts-nocheck
"use client";

import { useSession } from "next-auth/react";

export default function JobCard({ job, refreshJobs }: { job: unknown; refreshJobs: () => void }) {
  const { data: session } = useSession();

  const isTeam = session?.user?.role === "team";
  const isAdmin = session?.user?.role === "admin";
  const userId = session?.user?._id;
  // @ts-ignore
  const assignedTo = typeof job.assignedTo === "object" ? job.assignedTo._id : job.assignedTo;
  // @ts-ignore
  const statusText = job.status.replace("_", " ");

  const handleClaim = async () => {
    // @ts-ignore
    const res = await fetch(`/api/jobs/${job._id}/claim`, { method: "PATCH" });
    if (res.ok) refreshJobs();
  };

  const handleComplete = async () => {
    const res = await fetch(`/api/jobs/${job._id}/complete`, { method: "PATCH" });
    if (res.ok) refreshJobs();
  };

  const handleAccept = async () => {
    const res = await fetch(`/api/jobs/${job._id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "accepted" }),
    });
    if (res.ok) refreshJobs();
    else alert("Error: " + (await res.json())?.error || "Something went wrong");
  };

  const handleReject = async () => {
    const note = prompt("Enter rejection reason:");
    if (!note) return;
    const res = await fetch(`/api/jobs/${job._id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "rejected", rejectionNote: note }),
    });
    if (res.ok) refreshJobs();
    else alert("Error: " + (await res.json())?.error || "Something went wrong");
  };

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-white shadow-sm hover:shadow transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{job.carNumber}</h3>
          <p className="text-gray-600">{job.customerName}</p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${
          job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
          job.status === 'completed' ? 'bg-purple-100 text-purple-800' :
          job.status === 'accepted' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>
          {statusText}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-gray-500">Engine</p>
          <p>{job.engineNumber}</p>
        </div>
        {assignedTo && (
          <div>
            <p className="text-gray-500">Assigned</p>
            <p className="truncate">{job.assignedTo?.email || assignedTo}</p>
          </div>
        )}
      </div>

      {job.rejectionNote && isTeam && assignedTo === userId && (
        <div className="bg-red-50 p-2 rounded text-sm">
          <p className="font-medium text-red-700">Rejected:</p>
          <p className="text-red-600">{job.rejectionNote}</p>
        </div>
      )}

      {job.issues?.length > 0 && (
        <div className="bg-gray-50 p-2 rounded text-sm">
          <p className="font-medium">Issue:</p>
          <p className="text-gray-700">{job.issues[0].description}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        {isTeam && job.status === "pending" && !assignedTo && (
          <button
            onClick={handleClaim}
            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Claim
          </button>
        )}

        {isTeam && job.status === "in_progress" && assignedTo === userId && (
          <button
            onClick={handleComplete}
            className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            Complete
          </button>
        )}

        {isAdmin && job.status === "completed" && (
          <>
            <button
              onClick={handleAccept}
              className="px-3 py-1.5 bg-green-700 text-white rounded text-sm hover:bg-green-800"
            >
              Accept
            </button>
            <button
              onClick={handleReject}
              className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
}
