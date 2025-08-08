'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiUpload } from 'react-icons/fi';
import { inspectionTabs } from '@/config/inspectionTabs';
import type { Job, Severity } from '@/types/job';

export default function PostJobPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(inspectionTabs[0].key);
  const [form, setForm] = useState<Job>({
    _id: '',
    carNumber: '',
    customerName: '',
    engineNumber: '',
    status: 'pending',
    inspectionTabs: inspectionTabs.map(tab => ({
      ...tab,
      subIssues: tab.subIssues.map(issue => ({
        ...issue,
        severity: 'safe',
        comment: '',
        images: [],
      })),
    })),
  });

  const handleFileChange = (tabKey: string, issueKey: string, files: FileList | null) => {
    if (!files) return;
    setForm(prev => ({
      ...prev,
      inspectionTabs: prev.inspectionTabs.map(tab =>
        tab.key === tabKey
          ? {
              ...tab,
              subIssues: tab.subIssues.map(issue =>
                issue.key === issueKey
                  ? { ...issue, images: Array.from(files).map(f => URL.createObjectURL(f)) }
                  : issue
              ),
            }
          : tab
      ),
    }));
  };

  const handleSubmit = async () => {
    const payload = {
      carNumber: form.carNumber,
      customerName: form.customerName,
      engineNumber: form.engineNumber,
      inspectionTabs: form.inspectionTabs,
      status: 'pending',
    };
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) router.push('/admin/dashboard');
  };

  return (
    <div className="p-6">
      <div className="flex space-x-2 mb-4">
        {inspectionTabs.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded ${activeTab === tab.key ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {form.inspectionTabs
        .filter(tab => tab.key === activeTab)
        .map(tab => (
          <div key={tab.key} className="space-y-4">
            {tab.subIssues.map(issue => (
              <div key={issue.key} className="p-4 bg-white rounded shadow">
                <h3 className="font-bold mb-2">{issue.label}</h3>
                <select
                  value={issue.severity}
                  onChange={e =>
                    setForm(prev => ({
                      ...prev,
                      inspectionTabs: prev.inspectionTabs.map(t =>
                        t.key === tab.key
                          ? {
                              ...t,
                              subIssues: t.subIssues.map(i =>
                                i.key === issue.key ? { ...i, severity: e.target.value as Severity } : i
                              ),
                            }
                          : t
                      ),
                    }))
                  }
                  className="mb-2 border p-2 rounded w-full"
                >
                  <option value="safe">Safe</option>
                  <option value="failed">Failed</option>
                  <option value="needs_attention">Needs Attention</option>
                  <option value="other">Other</option>
                </select>

                <textarea
                  placeholder="Comment"
                  value={issue.comment}
                  onChange={e =>
                    setForm(prev => ({
                      ...prev,
                      inspectionTabs: prev.inspectionTabs.map(t =>
                        t.key === tab.key
                          ? {
                              ...t,
                              subIssues: t.subIssues.map(i =>
                                i.key === issue.key ? { ...i, comment: e.target.value } : i
                              ),
                            }
                          : t
                      ),
                    }))
                  }
                  className="w-full border p-2 rounded mb-2"
                />

                <label className="flex items-center space-x-2 cursor-pointer">
                  <FiUpload />
                  <span>Upload Images</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={e => handleFileChange(tab.key, issue.key, e.target.files)}
                  />
                </label>

                {issue.images.length > 0 && (
                  <div className="flex space-x-2 mt-2">
                    {issue.images.map((src, idx) => (
                      <img key={idx} src={src} alt="" className="w-20 h-20 object-cover rounded" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

      <button
        onClick={handleSubmit}
        className="mt-6 bg-indigo-600 text-white px-4 py-2 rounded"
      >
        Submit Job
      </button>
    </div>
  );
}
