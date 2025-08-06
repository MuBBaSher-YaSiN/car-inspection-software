// @ts-nocheck
"use client";

import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
} from "@/components/ui/card"; // Adjust import path if needed

export default function JobCard({ job, refreshJobs }: { job: unknown; refreshJobs: () => void }) {
  const { data: session } = useSession();

  const isTeam = session?.user?.role === "team";
  const isAdmin = session?.user?.role === "admin";
  const userId = session?.user?._id;
  const assignedTo = typeof job.assignedTo === "object" ? job.assignedTo._id : job.assignedTo;
  const statusText = job.status.replace("_", " ");

  const handleClaim = async () => {
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
    <Card className="hover:shadow transition-shadow">
      <CardContent className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-card-foreground">{job.carNumber}</h3>
            <p className="text-muted-foreground">{job.customerName}</p>
          </div>
          <span
            className={`px-2 py-1 text-xs rounded-full font-medium ${
              job.status === "pending"
                ? "bg-yellow-200 text-yellow-900 dark:bg-yellow-300/20 dark:text-yellow-300"
                : job.status === "in_progress"
                ? "bg-blue-200 text-blue-900 dark:bg-blue-300/20 dark:text-blue-300"
                : job.status === "completed"
                ? "bg-purple-200 text-purple-900 dark:bg-purple-300/20 dark:text-purple-300"
                : job.status === "accepted"
                ? "bg-green-200 text-green-900 dark:bg-green-300/20 dark:text-green-300"
                : "bg-red-200 text-red-900 dark:bg-red-300/20 dark:text-red-300"
            }`}
          >
            {statusText}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Engine</p>
            <p className="text-card-foreground">{job.engineNumber}</p>
          </div>
          {assignedTo && (
            <div>
              <p className="text-muted-foreground">Assigned</p>
              <p className="truncate text-card-foreground">
                {job.assignedTo?.email || assignedTo}
              </p>
            </div>
          )}
        </div>

        {job.rejectionNote && isTeam && assignedTo === userId && (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded text-sm">
            <p className="font-semibold text-red-700 dark:text-red-400">Rejected:</p>
            <p className="text-red-600 dark:text-red-300">{job.rejectionNote}</p>
          </div>
        )}

        {job.issues?.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
            <p className="font-medium text-card-foreground">Issue:</p>
            <p className="text-muted-foreground">{job.issues[0].description}</p>
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

          <button
            onClick={() => window.open(`/api/pdf/${job._id}`, "_blank")}
            className="px-3 py-1.5 bg-gray-700 text-white rounded text-sm hover:bg-gray-800"
          >
            Download PDF
          </button>

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
      </CardContent>
    </Card>
  );
}
