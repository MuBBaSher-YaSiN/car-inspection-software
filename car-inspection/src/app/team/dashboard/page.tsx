// 'use client';

// import { useEffect, useState } from 'react';
// import JobCard from '@/components/JobCard';

// export default function TeamDashboard() {
//   const [jobs, setJobs] = useState([]);

//   useEffect(() => {
//     fetch('/api/jobs')
//       .then((res) => res.json())
//       .then((data) => setJobs(data));
//   }, []);

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-bold mb-4">Assigned Jobs</h2>
//       {jobs.length === 0 ? (
//         <p>No jobs found.</p>
//       ) : (
//         jobs.map((job: any) => <JobCard key={job._id} job={job} />)
//       )}
//     </div>
//   );
// }
'use client';

import { useEffect, useState } from 'react';
import JobCard from '@/components/JobCard';

export default function TeamDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/jobs');
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

    fetchJobs();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Assigned Jobs</h2>
      {loading ? (
        <p>Loading...</p>
      ) : jobs.length === 0 ? (
        <p>No jobs found or access denied.</p>
      ) : (
        jobs.map((job: any) => <JobCard key={job._id} job={job} />)
      )}
    </div>
  );
}
