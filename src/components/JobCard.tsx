// @ts-nocheck
"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Sparkles, Check, X, Download, Wrench, Car, User } from "lucide-react";
import { cardVariants, buttonVariants, statusVariants } from "@/lib/animations";
export default function JobCard({ job, refreshJobs }: { job: unknown; refreshJobs: () => void }) {
  const { data: session } = useSession();
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [localStatus, setLocalStatus] = useState(job.status);

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

  
  const handleClaim = async () => {
    setIsAnimating(true);
    const res = await fetch(`/api/jobs/${job._id}/claim`, { method: "PATCH" });
    if (res.ok) {
      setLocalStatus("in_progress");
      setTimeout(() => refreshJobs(), 800);
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
            {isTeam && job.status === "pending" && !assignedTo && (
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={handleClaim}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Claim
              </motion.button>
            )}

            {isTeam && job.status === "in_progress" && assignedTo === userId && (
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

            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => window.open(`/api/pdf/${job._id}`, "_blank")}
              className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </motion.button>

            {isAdmin && job.status === "completed" && (
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
            )}
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

          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}