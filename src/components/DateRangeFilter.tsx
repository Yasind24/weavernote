import React from 'react';
import { Calendar } from 'lucide-react';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  dateType: 'created' | 'updated';
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onDateTypeChange: (type: 'created' | 'updated') => void;
  onClear: () => void;
}

export function DateRangeFilter({
  startDate,
  endDate,
  dateType,
  onStartDateChange,
  onEndDateChange,
  onDateTypeChange,
  onClear
}: DateRangeFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Calendar size={18} className="text-gray-400" />
      <select
        value={dateType}
        onChange={(e) => onDateTypeChange(e.target.value as 'created' | 'updated')}
        className="px-2 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
      >
        <option value="created">Created Date</option>
        <option value="updated">Last Modified</option>
      </select>
      <input
        type="datetime-local"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        className="px-2 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
      />
      <span className="text-gray-500">to</span>
      <input
        type="datetime-local"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        className="px-2 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
      />
      {(startDate || endDate) && (
        <button
          onClick={onClear}
          className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          Clear
        </button>
      )}
    </div>
  );
}