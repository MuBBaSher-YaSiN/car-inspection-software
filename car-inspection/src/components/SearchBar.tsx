"use client";

import { useState } from "react";

interface Props {
  onSearch: (query: string) => void;
  onStatusFilter?: (status: string) => void;
}

export default function SearchBar({ onSearch, onStatusFilter }: Props) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  return (
    <div className="flex items-center gap-4 mb-4">
      <input
        type="text"
        placeholder="Search by car number or customer name"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onSearch(e.target.value);
        }}
        className="border rounded px-3 py-2 w-full"
      />

      {onStatusFilter && (
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            onStatusFilter(e.target.value);
          }}
          className="border rounded px-3 py-2"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      )}
    </div>
  );
}
