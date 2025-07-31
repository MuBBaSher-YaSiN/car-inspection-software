import Link from 'next/link';

export default function JobCard({ job }: { job: any }) {
  return (
    <div className="border rounded p-4 shadow mb-4">
      <h3 className="text-lg font-bold">{job.carNumber}</h3>
      <p>Customer: {job.customerName}</p>
      <p>Engine: {job.engineNumber}</p>
      <p>Status: <span className="capitalize">{job.status}</span></p>
      {job.issues?.length > 0 && (
        <p className="text-sm mt-2 text-gray-600">
          {job.issues[0].description}
        </p>
      )}
    </div>
  );
}
