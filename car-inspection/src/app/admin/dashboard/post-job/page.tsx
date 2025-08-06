'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

export default function PostJobPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
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
      setForm(prev => ({ 
        ...prev, 
        images: Array.from(e.target.files),
      }));
      setSubmitSuccess(false);
      setSubmitError(null);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const imageUrls: string[] = form.images.map(() => "https://via.placeholder.com/300");

      const jobPayload = {
        carNumber: form.carNumber,
        customerName: form.customerName,
        engineNumber: form.engineNumber,
        issues: [{
          description: form.issueDescription,
          checklist: form.checklist,
          images: imageUrls,
        }],
        status: 'pending',
      };

      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobPayload),
      });

      if (res.ok) {
        setSubmitSuccess(true);
        setTimeout(() => router.push('/admin/dashboard'), 1500);
      } else {
        const error = await res.json();
        throw new Error(error.message || 'Failed to submit job');
      }
    } catch (err) {
      console.error("API error:", err);
      setSubmitError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6"
    >
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden p-6 mb-6"
        >
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-indigo-300 dark:to-blue-400 bg-clip-text text-transparent">
            Post New Job
          </h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {['carNumber', 'customerName', 'engineNumber'].map((field) => (
              <motion.div key={field} variants={itemVariants}>
                <input
                  type="text"
                  placeholder={field.replace(/([A-Z])/g, ' $1')}
                  value={form[field as keyof typeof form] as string}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                />
              </motion.div>
            ))}

            <motion.div variants={itemVariants}>
              <textarea
                placeholder="Issue Description"
                value={form.issueDescription}
                onChange={(e) => setForm({ ...form, issueDescription: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 min-h-[120px]"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="mb-4">
              <h3 className="font-semibold mb-3 text-lg text-gray-700 dark:text-gray-200">Checklist</h3>
              <div className="grid grid-cols-2 gap-3">
                {['brakes', 'lights', 'tires', 'engine'].map((item) => (
                  <motion.label 
                    key={item}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer capitalize"
                  >
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
                      className="h-5 w-5 text-indigo-600 dark:bg-gray-800 rounded focus:ring-indigo-500 transition"
                    />
                    <span className="text-gray-700 dark:text-gray-200">{item}</span>
                  </motion.label>
                ))}
              </div>

              <motion.div variants={itemVariants} className="mt-3">
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                />
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} className="mb-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all duration-300"
              >
                <FiUpload className="mx-auto text-3xl text-indigo-500 mb-2" />
                <p className="text-gray-600 dark:text-gray-300">
                  {form.images.length > 0 
                    ? `${form.images.length} file(s) selected` 
                    : "Click to upload images"}
                </p>
                {form.images.length > 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {form.images.map(f => f.name).join(', ')}
                  </p>
                )}
                <input
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="hidden"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full py-3 px-6 rounded-xl font-medium text-white transition-all duration-300 flex items-center justify-center
                  ${isSubmitting 
                    ? 'bg-indigo-400' 
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl'}
                `}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : 'Submit Job'}
              </button>
            </motion.div>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed bottom-6 right-6 bg-red-100 dark:bg-red-800 border-l-4 border-red-500 text-red-700 dark:text-red-100 p-4 rounded-lg shadow-lg max-w-sm"
            >
              <div className="flex items-center">
                <FiAlertCircle className="text-red-500 text-xl mr-2" />
                <p>{submitError}</p>
              </div>
            </motion.div>
          )}

          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed bottom-6 right-6 bg-green-100 dark:bg-green-800 border-l-4 border-green-500 text-green-700 dark:text-green-100 p-4 rounded-lg shadow-lg max-w-sm"
            >
              <div className="flex items-center">
                <FiCheckCircle className="text-green-500 text-xl mr-2" />
                <p>Job submitted successfully! Redirecting...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
