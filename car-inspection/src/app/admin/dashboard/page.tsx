// admin/dashboard/page.tsx or wherever AdminDashboard is used
'use client';
import JobCard from "@/components/JobCard";
import SearchBar from "@/components/SearchBar";
import type { Job } from "@/types/job";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filtered, setFiltered] = useState<Job[]>([]);

  const fetchJobs = async () => {
    const res = await fetch("/api/jobs");
    const data = await res.json();
    setJobs(data);
    setFiltered(data);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = (query: string) => {
    const filteredJobs = jobs.filter(
      (job) =>
        job.carNumber.toLowerCase().includes(query.toLowerCase()) ||
        job.customerName.toLowerCase().includes(query.toLowerCase())
    );
    setFiltered(filteredJobs);
  };

  const handleStatus = (status: string) => {
    if (!status) return setFiltered(jobs);

    if (status === "rejected") {
      const filteredJobs = jobs.filter((job) => job.rejectionNote?.length > 0);
      return setFiltered(filteredJobs);
    }

    if (status === "completed") {
      const filteredJobs = jobs.filter(
        (job) => job.status === "completed" || job.status === "accepted"
      );
      return setFiltered(filteredJobs);
    }

    const filteredJobs = jobs.filter((job) => job.status === status);
    setFiltered(filteredJobs);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">All Jobs</h2>

      <SearchBar onSearch={handleSearch} onStatusFilter={handleStatus} />

      {filtered.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        filtered.map((job) => (
          <JobCard key={job._id} job={job} refreshJobs={fetchJobs} />
        ))
      )}
    </div>
  );
}
