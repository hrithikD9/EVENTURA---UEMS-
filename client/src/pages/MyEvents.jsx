import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Search, Filter } from 'lucide-react';
import { eventService } from '@/services/eventService';
import { useAuth } from '@/hooks/useAuth';
import EventCard from '@/components/events/EventCard';
import Loader from '@/components/common/Loader';
import toast from 'react-hot-toast';

const MyEvents = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchMyEvents();
  }, [isAuthenticated]);

  useEffect(() => {
    filterEvents();
  }, [activeTab, searchTerm, events]);

  const fetchMyEvents = async () => {
    setLoading(true);
    try {
      // Get registered events from localStorage
      const registrations = JSON.parse(localStorage.getItem('eventRegistrations') || '{}');
      const registeredEventIds = Object.keys(registrations).filter(
        (eventId) => registrations[eventId] === user?.email
      );

      if (registeredEventIds.length > 0) {
        const eventPromises = registeredEventIds.map((eventId) =>
          eventService.getEventById(eventId).catch(() => null)
        );
        const eventResults = await Promise.all(eventPromises);
        const validEvents = eventResults.filter((event) => event !== null);
        setEvents(validEvents);
      } else {
        setEvents([]);
      }
    } catch (error) {
      toast.error('Failed to load your events');
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by tab (upcoming/past)
    const now = new Date();
    if (activeTab === 'upcoming') {
      filtered = filtered.filter((event) => new Date(event.date) >= now);
    } else if (activeTab === 'past') {
      filtered = filtered.filter((event) => new Date(event.date) < now);
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return activeTab === 'upcoming' ? dateA - dateB : dateB - dateA;
    });

    setFilteredEvents(filtered);
  };

  const tabs = [
    { id: 'upcoming', label: 'Upcoming', count: events.filter(e => new Date(e.date) >= new Date()).length },
    { id: 'past', label: 'Past', count: events.filter(e => new Date(e.date) < new Date()).length },
    { id: 'all', label: 'All', count: events.length },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-3">
            My Events
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your registered events and attendance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total Events</p>
                <p className="text-3xl font-bold text-gray-900">{events.length}</p>
              </div>
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Upcoming</p>
                <p className="text-3xl font-bold text-green-600">
                  {events.filter(e => new Date(e.date) >= new Date()).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">Attended</p>
                <p className="text-3xl font-bold text-blue-600">
                  {events.filter(e => new Date(e.date) < new Date()).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search your events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
        </div>

        {/* Events List */}
        {filteredEvents.length > 0 ? (
          <div>
            <div className="mb-4">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredEvents.length}</span>{' '}
                {activeTab === 'all' ? '' : activeTab} event{filteredEvents.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Events Yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You haven't registered for any events yet. Browse available events and register to get started!
            </p>
            <button
              onClick={() => navigate('/events')}
              className="btn btn-primary"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Events Found
            </h3>
            <p className="text-gray-600 mb-6">
              No {activeTab === 'all' ? '' : activeTab} events match your search criteria
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveTab('all');
              }}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEvents;
