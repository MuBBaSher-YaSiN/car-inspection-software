"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function JobCard({ job }: { job: any }) {
  const { data: session } = useSession();
  const router = useRouter();

  const isTeam = session?.user?.role === "team";
  const isAdmin = session?.user?.role === "admin";
  const userId = session?.user?._id;

  // Normalize assignedTo as string
  const assignedTo =
    typeof job.assignedTo === "object" ? job.assignedTo._id : job.assignedTo;

  const handleClaim = async () => {
    const res = await fetch(`/api/jobs/${job._id}/claim`, {
      method: "PATCH",
    });
    if (res.ok) router.refresh();
  };

  const handleComplete = async () => {
    const res = await fetch(`/api/jobs/${job._id}/complete`, {
      method: "PATCH",
    });
    if (res.ok) router.refresh();
  };

const handleAccept = async () => {
  const res = await fetch(`/api/jobs/${job._id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "completed" }),
  });

  const data = await res.json();
  if (res.ok) {
    router.refresh();
  } else {
    alert("Error: " + data?.error || "Something went wrong");
  }
};

const handleReject = async () => {
  const note = prompt("Enter rejection reason:");
  if (!note) return;

  const res = await fetch(`/api/jobs/${job._id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "rejected", rejectionNote: note }),
  });

  const data = await res.json();
  if (res.ok) {
    router.refresh();
  } else {
    alert("Error: " + data?.error || "Something went wrong");
  }
};


  return (
    <div className="border rounded p-4 shadow mb-4">
      <h3 className="text-lg font-bold">{job.carNumber}</h3>
      <p>Customer: {job.customerName}</p>
      <p>Engine: {job.engineNumber}</p>
      <p>
        Status:{" "}
        <span className="capitalize">{job.status.replace("_", " ")}</span>
      </p>

      {assignedTo && (
        <p className="text-sm text-gray-500">
          Claimed by: {job.assignedTo?.email || assignedTo}
        </p>
      )}

      {/* 🔴 Show rejection note only to assigned user */}
      {job.rejectionNote && assignedTo === userId && (
        <p className="text-sm text-red-600 mt-1">
          Rejected: {job.rejectionNote}
        </p>
      )}

      {job.issues?.length > 0 && (
        <p className="text-sm mt-2 text-gray-600">
          {job.issues[0].description}
        </p>
      )}

      <div className="mt-4 space-x-2">
        {/* 🔵 Claim */}
        {isTeam && job.status === "pending" && !assignedTo && (
          <button
            onClick={handleClaim}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Claim
          </button>
        )}

        {/* ✅ Mark as Complete */}
        {isTeam && job.status === "in_progress" && assignedTo === userId && (
          <button
            onClick={handleComplete}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            Mark as Complete
          </button>
        )}

        {/* 🟢 Accept / 🔴 Reject */}
        {isAdmin && job.status === "completed" && (
          <>
            <button
              onClick={handleAccept}
              className="bg-green-700 text-white px-3 py-1 rounded"
            >
              Accept
            </button>
            <button
              onClick={handleReject}
              className="bg-red-600 text-white px-3 py-1 rounded"
            >
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
}
