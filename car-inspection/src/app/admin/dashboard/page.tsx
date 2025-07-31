'use client';

import { useEffect, useState } from 'react';
import JobCard from '@/components/JobCard';

export default function AdminDashboard() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetch('/api/jobs')
      .then((res) => res.json())
      .then((data) => setJobs(data));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">All Jobs</h2>
      {jobs.length === 0 ? (
        <p>No jobs found.</p>
      ) : (
        jobs.map((job: any) => <JobCard key={job._id} job={job} />)
      )}
    </div>
  );
}
