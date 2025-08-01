'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PostJobPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    carNumber: '',
    customerName: '',
    engineNumber: '',
    issueDescription: '',
    checklist: {
      brakes: false,
      lights: false,
      tires: false,
      engine: false,
      other: '',
    },
    images: [] as File[],
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm(prev => ({ ...prev, images: Array.from(e.target.files) }));
    }
  };

 const handleSubmit = async () => {
  // Mock placeholder image URLs for dev
  const imageUrls: string[] = form.images.map(() => "https://via.placeholder.com/300");

  const jobPayload = {
    carNumber: form.carNumber,
    customerName: form.customerName,
    engineNumber: form.engineNumber,
    issues: [
      {
        description: form.issueDescription,
        checklist: form.checklist,
        images: imageUrls,
      },
    ],
    status: 'pending',
  };

  console.log("📦 jobPayload sent to API:", JSON.stringify(jobPayload, null, 2));

  const res = await fetch('/api/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobPayload),
  });

  if (res.ok) {
    router.push('/admin/dashboard');
  } else {
    const error = await res.json();
    console.error(" API error:", error);
  }
};


  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Post New Job</h2>
      <input
        type="text"
        placeholder="Car Number"
        value={form.carNumber}
        onChange={(e) => setForm({ ...form, carNumber: e.target.value })}
        className="input mb-2 w-full"
      />
      <input
        type="text"
        placeholder="Customer Name"
        value={form.customerName}
        onChange={(e) => setForm({ ...form, customerName: e.target.value })}
        className="input mb-2 w-full"
      />
      <input
        type="text"
        placeholder="Engine Number"
        value={form.engineNumber}
        onChange={(e) => setForm({ ...form, engineNumber: e.target.value })}
        className="input mb-2 w-full"
      />
      <textarea
        placeholder="Issue Description"
        value={form.issueDescription}
        onChange={(e) => setForm({ ...form, issueDescription: e.target.value })}
        className="textarea mb-2 w-full"
      />
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Checklist</h3>

        {['brakes', 'lights', 'tires', 'engine'].map((item) => (
          <label key={item} className="flex items-center space-x-2 mb-1 capitalize">
            <input
              type="checkbox"
              checked={form.checklist[item as keyof typeof form.checklist] as boolean}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  checklist: {
                    ...prev.checklist,
                    [item]: e.target.checked,
                  },
                }))
              }
            />
            <span>{item}</span>
          </label>
        ))}

        <input
          type="text"
          placeholder="Other issues"
          value={form.checklist.other}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              checklist: { ...prev.checklist, other: e.target.value },
            }))
          }
          className="input w-full mt-2"
        />
      </div>

      <input
        type="file"
        multiple
        onChange={handleImageChange}
        className="mb-2"
      />
      <button onClick={handleSubmit} className="btn btn-primary mt-4">
        Submit Job
      </button>
    </div>
  );
}
