import { useEffect } from 'react';
import { useEvents } from '@/hooks/useEvents';
import EventList from '@/components/events/EventList';
import EventFilters from '@/components/events/EventFilters';

const Events = () => {
  const { events, loading, filters, updateFilters } = useEvents();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
            Discover Events
          </h1>
          <p className="text-lg text-gray-600">
            Find and register for exciting university events
          </p>
        </div>

        {/* Filters */}
        <EventFilters filters={filters} onFilterChange={updateFilters} />

        {/* Event List */}
        <EventList events={events} loading={loading} />
      </div>
    </div>
  );
};

export default Events;
