import { Search, Filter } from 'lucide-react';
import { EVENT_CATEGORIES } from '@/utils/constants';

const EventFilters = ({ filters, onFilterChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="input pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={filters.category || ''}
            onChange={(e) => onFilterChange({ category: e.target.value })}
            className="input pl-10 appearance-none"
          >
            <option value="">All Categories</option>
            {EVENT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={filters.upcoming === 'true' ? 'upcoming' : 'all'}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'upcoming') {
                onFilterChange({ upcoming: 'true' });
              } else if (value === 'all') {
                onFilterChange({ upcoming: undefined });
              }
            }}
            className="input appearance-none"
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming Events</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default EventFilters;
