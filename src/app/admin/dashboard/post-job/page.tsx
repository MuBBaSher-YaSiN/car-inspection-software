"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
// import { FiUpload } from "react-icons/fi";
import { inspectionTabs } from "@/config/inspectionTabs";
import type { Job, Severity, InspectionType } from "@/types/job";
// import Image from "next/image";

export default function PostJobPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("");
  const prevInspectionTypeRef = useRef<InspectionType | undefined>(undefined);
  const [form, setForm] = useState<Job>({
    _id: "",
    carNumber: "",
    customerName: "",
    engineNumber: "",
    status: "pending",
    inspectionTabs: [],
  });

  // const uploadToCloudinary = async (file: File) => {
  //   const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
  //   const formData = new FormData();
  //   formData.append("file", file);
  //   formData.append(
  //     "upload_preset",
  //     process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
  //   );

  //   const res = await fetch(url, { method: "POST", body: formData });
  //   if (!res.ok) throw new Error("Cloudinary upload failed");
  //   const data = await res.json();
  //   return data.secure_url as string;
  // };

  // const handleFileChange = async (
  //   tabKey: string,
  //   issueKey: string,
  //   files: FileList | null
  // ) => {
  //   if (!files) return;
  //   try {
  //     const uploadedUrls = await Promise.all(
  //       Array.from(files).map((file) => uploadToCloudinary(file))
  //     );
  //     setForm((prev) => ({
  //       ...prev,
  //       inspectionTabs: prev.inspectionTabs.map((tab) =>
  //         tab.key === tabKey
  //           ? {
  //               ...tab,
  //               subIssues: tab.subIssues.map((issue) =>
  //                 issue.key === issueKey
  //                   ? { ...issue, images: [...issue.images, ...uploadedUrls] }
  //                   : issue
  //               ),
  //             }
  //           : tab
  //       ),
  //     }));
  //   } catch (error) {
  //     console.error("Image upload failed", error);
  //   }
  // };

  // Update inspection tabs when inspection type changes
  useEffect(() => {
    if (form.inspectionType && prevInspectionTypeRef.current !== form.inspectionType) {
      // Filter tabs based on the selected inspection type
      const relevantTabs = inspectionTabs.filter((tab) => 
        tab.classification.includes(form.inspectionType || "")
      );
      
      // Create new tabs with default values
      const newTabs = relevantTabs.map((tab) => ({
        ...tab,
        subIssues: tab.subIssues.map((issue) => ({
          ...issue,
          severity: "ok" as Severity,
          comment: "",
        })),
      }));
      
      setForm((prev) => ({
        ...prev,
        inspectionTabs: newTabs,
      }));
      
      // Set active tab to the first relevant tab
      const firstTab = relevantTabs[0];
      if (firstTab) {
        setActiveTab(firstTab.key);
      }
      
      // Update the ref
      prevInspectionTypeRef.current = form.inspectionType;
    }
  }, [form.inspectionType]);

  const handleSubmit = async () => {
    // Validate required fields
    if (!form.carNumber) {
      alert("Please enter a car number");
      return;
    }
    if (!form.customerName) {
      alert("Please enter an inspector name");
      return;
    }
    if (!form.inspectionType) {
      alert("Please select an inspection type");
      return;
    }
    
    const payload = {
      carNumber: form.carNumber,
      customerName: form.customerName,
      engineNumber: form.engineNumber,
      inspectionType: form.inspectionType,
      inspectionTabs: form.inspectionTabs,
      status: "pending",
    };
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) router.push("/admin/dashboard");
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Job Details */}
      <div className="bg-white dark:bg-gray-800 rounded shadow p-4 space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Job Details
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Car Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Car Number"
            value={form.carNumber}
            onChange={(e) => setForm({ ...form, carNumber: e.target.value })}
            className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Inspector Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Inspector Name"
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Chassis Number
          </label>
          <input
            type="text"
            placeholder="Chassis Number"
            value={form.engineNumber}
            onChange={(e) => setForm({ ...form, engineNumber: e.target.value })}
            className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Inspection Type <span className="text-red-500">*</span>
          </label>
          <select
            value={form.inspectionType || ""}
            onChange={(e) => setForm({ ...form, inspectionType: e.target.value as InspectionType })}
            className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select Inspection Type</option>
            <option value="Chassis inspection">Chassis inspection</option>
            <option value="Paint inspection">Paint inspection</option>
            <option value="Paint and chassis inspection">Paint and chassis inspection</option>
            <option value="OBD inspection">OBD inspection</option>
            <option value="360 inspection">360 inspection</option>
          </select>
        </div>
      </div>
{form.inspectionType &&    <>
      {/* Tabs */}
      <div className="flex flex-wrap space-x-2 mb-4">
        {form.inspectionTabs.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 my-2 rounded transition-colors ${
              activeTab === tab.key
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {form.inspectionTabs
        .filter((tab) => tab.key === activeTab)
        .map((tab) => (
          <div key={tab.key} className="space-y-4">
            {tab.subIssues.map((issue) => (
              <div
                key={issue.key}
                className="p-4 bg-white dark:bg-gray-800 rounded shadow"
              >
                <h3 className="font-bold mb-2 text-gray-900 dark:text-white">
                  {issue.label}
                </h3>

                <select
                  value={issue.severity}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      inspectionTabs: prev.inspectionTabs.map((t) =>
                        t.key === tab.key
                          ? {
                              ...t,
                              subIssues: t.subIssues.map((i) =>
                                i.key === issue.key
                                  ? {
                                      ...i,
                                      severity: e.target.value as Severity,
                                    }
                                  : i
                              ),
                            }
                          : t
                      ),
                    }))
                  }
                  className="mb-2 border border-gray-300 dark:border-gray-600 p-2 rounded w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="minor">Minor</option>
                  <option value="major">Major</option>
                  <option value="ok">OK</option>
                </select>

                <textarea
                  placeholder="Comment"
                  value={issue.comment}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      inspectionTabs: prev.inspectionTabs.map((t) =>
                        t.key === tab.key
                          ? {
                              ...t,
                              subIssues: t.subIssues.map((i) =>
                                i.key === issue.key
                                  ? { ...i, comment: e.target.value }
                                  : i
                              ),
                            }
                          : t
                      ),
                    }))
                  }
                  className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />

                {/* <label className="flex items-center space-x-2 cursor-pointer text-gray-900 dark:text-white">
                  <FiUpload />
                  <span>Upload Images</span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) =>
                      handleFileChange(tab.key, issue.key, e.target.files)
                    }
                  />
                </label> */}

                {/* {issue.images.length > 0 && (
                  <div className="flex space-x-2 mt-2">
                    {issue.images.map((src, idx) => (
                      <div
                        key={idx}
                        className="relative w-20 h-20 rounded border border-gray-300 dark:border-gray-600 overflow-hidden"
                      >
                        <Image
                          src={src}
                          alt={`Issue image ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    ))}
                  </div>
                )} */}
              </div>
            ))}
          </div>
        ))}
    </>}
      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="mt-6 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white px-4 py-2 rounded transition-colors"
      >
        Submit Job
      </button>
    </div>
  );
}
