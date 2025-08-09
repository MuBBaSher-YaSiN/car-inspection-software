'use client';
import JobCard from "@/components/JobCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Search, Filter, RefreshCw } from "lucide-react";
import type { Job } from "@/types/job";
import { containerVariants, titleVariants } from "@/lib/animations";


export default function AdminDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filtered, setFiltered] = useState<Job[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchJobs = async () => {
    setIsRefreshing(true);
    const res = await fetch("/api/jobs");
    const data = await res.json();
    setJobs(data);
    setFiltered(data);
    setIsRefreshing(false);
    setIsInitialLoad(false);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSearch = (query: string) => {
    const filteredJobs = jobs.filter(
      (job) =>
        job.carNumber.toLowerCase().includes(query.toLowerCase()) ||
        job.customerName.toLowerCase().includes(query.toLowerCase())
    );
    setFiltered(filteredJobs);
  };

  const handleStatus = (status: string) => {
    if (status === "all" || !status) return setFiltered(jobs);

    if (status === "rejected") {
      const filteredJobs = jobs.filter((job) => job.rejectionNote?.length > 0);
      return setFiltered(filteredJobs);
    }

    if (status === "completed") {
      const filteredJobs = jobs.filter(
        (job) => job.status === "completed" || job.status === "accepted"
      );
      return setFiltered(filteredJobs);
    }

    const filteredJobs = jobs.filter((job) => job.status === status);
    setFiltered(filteredJobs);
  };

  

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial="hidden"
        animate="show"
        variants={containerVariants}
        className="space-y-6"
      >
        {/* Header with search */}
       
        <motion.div variants={titleVariants} className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              All Jobs
            </h2>
            <p className="text-muted-foreground">Manage and monitor all service requests</p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchJobs}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </motion.button>
        </motion.div>

        {/* Search and filter */}
      
        <motion.div 
          variants={titleVariants}
          className="grid grid-cols-1 md:grid-cols-2 pb-2 gap-4"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by car number or customer..."
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
            />
          </div>
          
          <Select onValueChange={(value) => handleStatus(value === "all" ? "" : value)}>
            <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80">
              <SelectItem value="all">All Jobs</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Jobs list */}
        {isInitialLoad ? (
          <motion.div 
            variants={titleVariants}
            className="flex flex-col items-center justify-center py-12 gap-4"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
              <RefreshCw className="w-10 h-10 text-blue-500 dark:text-blue-400 animate-spin" />
            </div>
            <h3 className="text-xl font-semibold">Loading jobs...</h3>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div 
            variants={titleVariants}
            className="flex flex-col items-center justify-center py-12 gap-4 text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
              <Search className="w-10 h-10 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold">No jobs found</h3>
            <p className="text-muted-foreground max-w-md">
              Try adjusting your search or filter to find what you are looking for
            </p>
          </motion.div>
        ) : (
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 gap-4"
          >
            <AnimatePresence>
              {filtered.map((job) => (
                <JobCard key={job._id} job={job} refreshJobs={fetchJobs} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}