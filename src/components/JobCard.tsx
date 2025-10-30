// @ts-nocheck
"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Sparkles, Check, X, Download, Wrench, Car, User } from "lucide-react";
import { cardVariants, buttonVariants, statusVariants } from "@/lib/animations";
import { inspectionTabs as baseTabs } from "@/config/inspectionTabs";
import type { Severity } from "@/types/job";
export default function JobCard({ job, refreshJobs }: { job: unknown; refreshJobs: () => void }) {
  const { data: session } = useSession();
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [localStatus, setLocalStatus] = useState(job.status);
  
  // Dialog and form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState(baseTabs[0].key);
  const [formData, setFormData] = useState({
    carNumber: job.carNumber || "",
    customerName: job.customerName || "",
    engineNumber: job.engineNumber || "",
    inspectionTabs: []
  });

  const isTeam = session?.user?.role === "team";
  const isAdmin = session?.user?.role === "admin";
  const userId = session?.user?._id;
  const assignedTo = typeof job.assignedTo === "object" ? job.assignedTo._id : job.assignedTo;
  const statusText = job.status.replace("_", " ");

  // Status color mapping
  const statusColors = {
    pending: { bg: "bg-yellow-500/10", text: "text-yellow-500", border: "border-yellow-500/30" },
    in_progress: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/30" },
    completed: { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/30" },
    accepted: { bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/30" },
    rejected: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/30" }
  };

  
  // Open dialog when Start Inspection is clicked
  const handleStartInspectionClick = () => {
    setIsDialogOpen(true);
    setIsFormSubmitted(false);
    setActiveTab(baseTabs[0].key);
    
    // Merge existing inspectionTabs with baseTabs
    const mergedTabs = baseTabs.map((tab) => {
      const existingTab = job.inspectionTabs?.find((t: any) => t.key === tab.key);
      return {
        ...tab,
        subIssues: tab.subIssues.map((issue) => {
          const existingIssue = existingTab?.subIssues?.find((i: any) => i.key === issue.key);
          return {
            ...issue,
            severity: existingIssue?.severity || "ok",
            comment: existingIssue?.comment || "",
          };
        }),
      };
    });
    
    // Reset form data to current job data
    setFormData({
      carNumber: job.carNumber || "",
      customerName: job.customerName || "",
      engineNumber: job.engineNumber || "",
      inspectionTabs: mergedTabs
    });
  };

  // Handle form submission in dialog
  const handleFormSubmit = () => {
    // Validate fields
    if (!formData.carNumber || !formData.customerName) {
      alert("Please fill in all required fields");
      return;
    }
    setIsFormSubmitted(true);
  };

  // Handle final start action (update job + claim)
  const handleStartInspection = async () => {
    setIsAnimating(true);
    
    try {
      // First, update the job with new data including inspectionTabs
      const updateRes = await fetch(`/api/jobs/${job._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carNumber: formData.carNumber,
          customerName: formData.customerName,
          engineNumber: formData.engineNumber,
          inspectionTabs: formData.inspectionTabs
        })
      });

      if (!updateRes.ok) {
        alert("Error updating job");
        setIsAnimating(false);
        return;
      }

      // Then, claim the job
      const claimRes = await fetch(`/api/jobs/${job._id}/claim`, { method: "PATCH" });
      if (claimRes.ok) {
        setLocalStatus("in_progress");
        setIsDialogOpen(false);
        setIsFormSubmitted(false);
        setTimeout(() => refreshJobs(), 800);
      } else {
        alert("Error claiming job");
      }
    } catch (error) {
      console.error("Error starting inspection:", error);
      alert("An error occurred");
    }
    
    setIsAnimating(false);
  };

  const handleComplete = async () => {
    setIsAnimating(true);
    const res = await fetch(`/api/jobs/${job._id}/complete`, { method: "PATCH" });
    if (res.ok) {
      setLocalStatus("completed");
      setTimeout(() => refreshJobs(), 800);
    }
    setIsAnimating(false);
  };

  const handleAccept = async () => {
    setIsAnimating(true);
    const res = await fetch(`/api/jobs/${job._id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "accepted" }),
    });
    if (res.ok) {
      setLocalStatus("accepted");
      setTimeout(() => refreshJobs(), 800);
    } else {
      alert("Error: " + (await res.json())?.error || "Something went wrong");
    }
    setIsAnimating(false);
  };

  const handleReject = async () => {
    const note = prompt("Enter rejection reason:");
    if (!note) return;
    
    setIsAnimating(true);
    const res = await fetch(`/api/jobs/${job._id}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "rejected", rejectionNote: note }),
    });
    if (res.ok) {
      setLocalStatus("rejected");
      setTimeout(() => refreshJobs(), 800);
    } else {
      alert("Error: " + (await res.json())?.error || "Something went wrong");
    }
    setIsAnimating(false);
  };

const handleDelete = async () => {
  if (!confirm("Are you sure you want to delete this job?")) return;
  setIsAnimating(true);
  const res = await fetch(`/api/jobs/${job._id}`, { method: "DELETE" });
  if (res.ok) {
    alert("Job deleted successfully");
    setTimeout(() => refreshJobs(), 800);
  } else {
    const data = await res.json();
    alert("Error: " + (data?.error || "Something went wrong"));
  }
  setIsAnimating(false);
};

const handleEdit = () => {
  // Navigate to an edit page — which will be a modified PostJobPage
  window.location.href = `/admin/dashboard/edit-job/${job._id}`;
};

  // Particle effect for status changes
  const renderParticles = () => {
    if (!isAnimating) return null;
    
    const particles = [];
    for (let i = 0; i < 20; i++) {
      particles.push(
        <motion.div
          key={i}
          className={`absolute w-2 h-2 rounded-full ${
            statusColors[localStatus]?.bg.replace("/10", "/80") || "bg-blue-500/80"
          }`}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{
            x: Math.random() * 100 - 50,
            y: Math.random() * -100 - 50,
            opacity: 0,
            scale: [1, 1.5, 0]
          }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
            delay: Math.random() * 0.5
          }}
        />
      );
    }
    return particles;
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      variants={cardVariants}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative overflow-hidden mb-3"
    >
      {/* Glow effect */}
      <div className={`absolute inset-0 ${
        statusColors[localStatus]?.bg.replace("/10", "/5") || "bg-blue-500/5"
      } rounded-xl`}></div>
      
      {/* Particle effect container */}
      {isAnimating && (
        <div className="absolute inset-0 pointer-events-none">
          {renderParticles()}
        </div>
      )}
      
      <Card className={`relative border ${
        statusColors[localStatus]?.border || "border-gray-200"
      } backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 transition-all duration-300`}>
        <CardContent className="space-y-4 p-6">
          {/* Header with car number and status */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <motion.div 
                animate={{ rotate: isHovered ? 10 : 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Car className={`w-6 h-6 ${
                  statusColors[localStatus]?.text || "text-gray-500"
                }`} />
              </motion.div>
              <div>
                <h3 className="font-bold text-xl text-card-foreground flex items-center gap-2">
                  {job.carNumber}
                  {isHovered && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-xs bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2 py-1 rounded-full"
                    >
                      #{job._id.slice(-4)}
                    </motion.span>
                  )}
                </h3>
                <p className="text-muted-foreground flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {job.customerName}
                </p>
              </div>
            </div>
            
            <motion.span
              variants={statusVariants}
              className={`px-3 py-1.5 text-xs rounded-full font-medium flex items-center gap-1 ${
                statusColors[localStatus]?.bg || "bg-gray-100"
              } ${statusColors[localStatus]?.text || "text-gray-800"}`}
            >
              {localStatus === "accepted" && <Check className="w-3 h-3" />}
              {localStatus === "rejected" && <X className="w-3 h-3" />}
              {localStatus === "in_progress" && <Wrench className="w-3 h-3" />}
              {statusText}
            </motion.span>
          </div>

          {/* Details grid */}
          <motion.div 
            className="grid grid-cols-2 gap-4 text-sm bg-gradient-to-br from-white/30 to-transparent dark:from-gray-800/30 p-4 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Engine</p>
                <p className="text-card-foreground font-medium">{job.engineNumber}</p>
              </div>
            </div>
            
            {assignedTo && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Assigned</p>
                  <p className="truncate text-card-foreground font-medium">
                    {job.assignedTo?.email || assignedTo}
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Rejection note */}
          {job.rejectionNote && isTeam && assignedTo === userId && (
            <motion.div 
              className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm border border-red-200 dark:border-red-900/30"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                <X className="w-4 h-4" />
                Rejected
              </p>
              <p className="text-red-600 dark:text-red-300 mt-1">{job.rejectionNote}</p>
            </motion.div>
          )}

          {/* Issues */}
          {job.issues?.length > 0 && (
            <motion.div 
              className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm border border-gray-200 dark:border-gray-700"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <p className="font-medium text-card-foreground flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Issue
              </p>
              <p className="text-muted-foreground mt-1">{job.issues[0].description}</p>
            </motion.div>
          )}

          {/* Action buttons */}
          <motion.div 
            className="flex flex-wrap gap-2 pt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >

           {job.status !== "pending" && <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => window.open(`/api/pdf/${job._id}`, "_blank")}
              className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </motion.button>}

            {/* {isAdmin && job.status === "completed" && (
              <>
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleAccept}
                  className="px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <Check className="w-4 h-4" />
                  Accept
                </motion.button>
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleReject}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                  <X className="w-4 h-4" />
                  Reject
                </motion.button>
              </>
            )} */}
            {isAdmin && (
  <>
    <motion.button
      variants={buttonVariants}
      whileHover="hover"
      whileTap="tap"
      onClick={handleEdit}
      className="px-4 py-2 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-lg text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
    >
      <Check className="w-4 h-4" />
      Edit
    </motion.button>
    <motion.button
      variants={buttonVariants}
      whileHover="hover"
      whileTap="tap"
      onClick={handleDelete}
      className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
    >
      <X className="w-4 h-4" />
      Delete
    </motion.button>
  </>
)}
            {isAdmin && job.status === "pending" && (
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={handleStartInspectionClick}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Start Inspection
              </motion.button>
            )}
            {isAdmin && job.status === "in_progress" && (
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={handleComplete}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <Check className="w-4 h-4" />
                Complete
              </motion.button>
            )}
          </motion.div>
        </CardContent>
      </Card>

      {/* Dialog for editing job details before starting inspection */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isFormSubmitted ? "Ready to Start Inspection" : "Edit Job Details"}
            </DialogTitle>
            <DialogDescription>
              {isFormSubmitted 
                ? "Click 'Start' to begin the inspection with the updated details." 
                : "Update the job details and inspection items before starting."}
            </DialogDescription>
          </DialogHeader>

          {!isFormSubmitted ? (
            // Form fields
            <div className="space-y-6 py-4">
              {/* Basic Job Details */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-lg">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="carNumber">Car Number *</Label>
                    <Input
                      id="carNumber"
                      value={formData.carNumber}
                      onChange={(e) => setFormData({ ...formData, carNumber: e.target.value })}
                      placeholder="Enter car number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name *</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="engineNumber">Engine Number</Label>
                    <Input
                      id="engineNumber"
                      value={formData.engineNumber}
                      onChange={(e) => setFormData({ ...formData, engineNumber: e.target.value })}
                      placeholder="Enter engine number"
                    />
                  </div>
                </div>
              </div>

              {/* Inspection Tabs */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Inspection Details</h3>
                
                {/* Tabs */}
                <div className="flex flex-wrap gap-2">
                  {baseTabs.map((tab) => (
                    <button
                      key={tab.key}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        activeTab === tab.key
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {formData.inspectionTabs
                    ?.filter((tab) => tab.key === activeTab)
                    .map((tab) => (
                      <div key={tab.key} className="space-y-3">
                        {tab.subIssues.map((issue) => (
                          <div
                            key={issue.key}
                            className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3"
                          >
                            <h4 className="font-medium text-sm">{issue.label}</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label className="text-xs">Severity</Label>
                                <select
                                  value={issue.severity}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      inspectionTabs: prev.inspectionTabs.map((t) =>
                                        t.key === tab.key
                                          ? {
                                              ...t,
                                              subIssues: t.subIssues.map((i) =>
                                                i.key === issue.key
                                                  ? { ...i, severity: e.target.value as Severity }
                                                  : i
                                              ),
                                            }
                                          : t
                                      ),
                                    }))
                                  }
                                  className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                  <option value="ok">OK</option>
                                  <option value="minor">Minor</option>
                                  <option value="major">Major</option>
                                </select>
                              </div>
                              
                              <div className="space-y-1 md:col-span-2">
                                <Label className="text-xs">Comment</Label>
                                <textarea
                                  placeholder="Add comment..."
                                  value={issue.comment}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
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
                                  className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[60px]"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            // Confirmation view
            <div className="space-y-4 py-4 max-h-[500px] overflow-y-auto">
              <div className="space-y-3">
                <h3 className="font-semibold">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-muted-foreground">Car Number</p>
                    <p className="font-medium">{formData.carNumber}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-muted-foreground">Customer Name</p>
                    <p className="font-medium">{formData.customerName}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg md:col-span-2">
                    <p className="text-sm text-muted-foreground">Engine Number</p>
                    <p className="font-medium">{formData.engineNumber || "N/A"}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Inspection Summary</h3>
                <p className="text-sm text-muted-foreground">
                  All inspection details have been recorded. Click 'Start' to begin the inspection.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            {!isFormSubmitted ? (
              <>
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleFormSubmit}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg text-sm shadow-md hover:shadow-lg transition-all"
                >
                  Submit
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setIsFormSubmitted(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  Back
                </motion.button>
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={handleStartInspection}
                  disabled={isAnimating}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4" />
                  {isAnimating ? "Starting..." : "Start"}
                </motion.button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}