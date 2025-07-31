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
    const imageUrls: string[] = [];

    for (const img of form.images) {
      const formData = new FormData();
      formData.append('file', img);
      formData.append('upload_preset', 'your_upload_preset'); // replace

      const res = await fetch('https://api.cloudinary.com/v1_1/your-cloud-name/image/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      imageUrls.push(data.secure_url);
    }

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

    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobPayload),
    });

    if (res.ok) {
      router.push('/admin/dashboard');
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
