"use client";

import { useEffect, useState } from "react";
import JobCard from "@/components/JobCard";

export default function TeamDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      console.log("✅ Team dashboard jobs response:", data);

      if (Array.isArray(data)) {
        setJobs(data);
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error("❌ Failed to fetch jobs:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Available & Assigned Jobs</h2>
      {loading ? (
        <p>Loading...</p>
      ) : jobs.length === 0 ? (
        <p>No jobs found or access denied.</p>
      ) : (
        jobs.map((job: unknown) => (
          <JobCard key={job._id} job={job} refreshJobs={fetchJobs} />
        ))
      )}
    </div>
  );
}
