import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
  User as UserIcon,
  ArrowLeft,
  Share2,
  Bookmark,
  Edit,
  Eye,
  Trash2,
  BarChart,
} from 'lucide-react';
import { eventService } from '@/services/eventService';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import Modal from '@/components/common/Modal';
import { formatDate, formatTime } from '@/utils/helpers';
import toast from 'react-hot-toast';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    
    // Set up polling to refresh event data every 30 seconds for real-time updates
    const intervalId = setInterval(() => {
      fetchEventDetails();
    }, 30000); // 30 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [id]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const response = await eventService.getEventById(id);
      const data = response.data || {};
      setEvent(data);
      
      // Check if user is already registered
      if (isAuthenticated && data) {
        const registrations = JSON.parse(localStorage.getItem('eventRegistrations') || '{}');
        setIsRegistered(registrations[data.id] === user?.email);
      }
    } catch (error) {
      toast.error('Failed to load event details');
      console.error('Error fetching event:', error);
      setEvent({});
    } finally {
      setLoading(false);
    }
  };

  const handleManageEvent = () => {
    setShowManageModal(true);
  };

  const handleEditEvent = () => {
    setShowManageModal(false);
    navigate(`/create-event?edit=${id}`);
  };

  const handleViewAnalytics = () => {
    setShowManageModal(false);
    toast('Analytics feature coming soon!', {
      icon: '📊',
      duration: 3000,
    });
    // Future: navigate to analytics page
    // navigate(`/events/${id}/analytics`);
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }
    
    setShowManageModal(false);
    try {
      await eventService.deleteEvent(id);
      toast.success('Event deleted successfully');
      navigate('/my-events');
    } catch (error) {
      toast.error('Failed to delete event');
      console.error('Error deleting event:', error);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to register for events');
      navigate('/login');
      return;
    }

    setRegistering(true);
    try {
      await eventService.registerForEvent(event.id, user.id);
      setIsRegistered(true);
      toast.success('Successfully registered for the event!');
      // Refresh event details to get updated attendee count
      await fetchEventDetails();
    } catch (error) {
      toast.error(error.message || 'Failed to register for event');
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    setRegistering(true);
    try {
      await eventService.unregisterFromEvent(event.id, user.id);
      setIsRegistered(false);
      toast.success('Successfully unregistered from the event');
      await fetchEventDetails();
    } catch (error) {
      toast.error('Failed to unregister from event');
    } finally {
      setRegistering(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
          <p className="text-gray-600 mb-6">The event you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/events')}>Back to Events</Button>
        </div>
      </div>
    );
  }

  const maxAttendees = event.maxAttendees || event.capacity || 0;
  const currentAttendees = event.attendees || event.currentAttendees || 0;
  const spotsLeft = maxAttendees - currentAttendees;
  const isFullyBooked = spotsLeft <= 0;
  const isDeadlinePassed = event.registrationDeadline ? new Date(event.registrationDeadline) < new Date() : false;
  const canRegister = !isFullyBooked && !isDeadlinePassed && !isRegistered;
  
  // Check if current user is the event creator/owner
  const isEventOwner = isAuthenticated && (
    event.createdBy === user?.email || 
    event.createdBy === user?.id ||
    event.createdById === user?.id ||
    event.organizerId === user?.id ||
    // Check if the organizer name matches the user's name/department
    event.organizer === user?.name ||
    event.organizer === user?.department ||
    event.organizer?.name === user?.name ||
    event.organizer?.name === user?.department ||
    // Check if user's organization name is in the event's organizer field
    (typeof event.organizer === 'string' && user?.department && event.organizer.includes(user.department)) ||
    (typeof event.organizer === 'string' && user?.name && event.organizer.includes(user.name))
  );
  
  // Determine if user can manage this event (owner or admin)
  const canManageEvent = isEventOwner || user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-[400px] object-cover"
              />
            </div>

            {/* Event Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Title and Status */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <span className={`badge badge-${event.status === 'upcoming' ? 'success' : 'secondary'} mb-3`}>
                    {event.status ? event.status.charAt(0).toUpperCase() + event.status.slice(1) : 'Unknown'}
                  </span>
                  <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                    {event.title || 'Untitled Event'}
                  </h1>
                  <div className="flex items-center text-gray-600">
                    <Tag className="h-4 w-4 mr-2" />
                    <span className="text-sm">{event.category || 'Uncategorized'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleShare}
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Share event"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Bookmark event"
                  >
                    <Bookmark className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium text-gray-900">
                      {event.date || event.eventDate ? formatDate(event.date || event.eventDate) : 'TBA'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium text-gray-900">
                      {event.time ? formatTime(event.time) : 'TBA'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">{event.location || 'TBA'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-teal-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Attendees</p>
                    <p className="font-medium text-gray-900">
                      {currentAttendees} / {maxAttendees}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-xl font-display font-bold text-gray-900 mb-3">
                  About This Event
                </h2>
                <p className="text-gray-700 leading-relaxed">{event.description}</p>
              </div>

              {/* Speakers (if any) */}
              {event.speakers && event.speakers.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-display font-bold text-gray-900 mb-3">
                    Speakers
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {event.speakers.map((speaker, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-gray-100 px-3 py-2 rounded-lg"
                      >
                        <UserIcon className="h-4 w-4 text-gray-600 mr-2" />
                        <span className="text-sm font-medium text-gray-700">
                          {typeof speaker === 'object' ? speaker.name || speaker.title || 'Speaker' : speaker}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div>
                  <h2 className="text-xl font-display font-bold text-gray-900 mb-3">
                    Tags
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="badge badge-secondary"
                      >
                        #{typeof tag === 'object' ? tag.name || tag.label || 'tag' : tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              {/* Organizer Info */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Organized by</h3>
                <Link
                  to={`/organizations/${event.organizerId || event.organizer?.orgId}`}
                  className="flex items-center group"
                >
                  <div className="h-12 w-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                    {(event.organizer?.name || event.organizer || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                      {event.organizer?.name || event.organizer || 'Unknown Organizer'}
                    </p>
                    <p className="text-sm text-gray-500">View profile</p>
                  </div>
                </Link>
              </div>

              {/* Registration Deadline */}
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Registration Deadline</p>
                <p className="font-medium text-gray-900">
                  {formatDate(event.registrationDeadline)}
                </p>
              </div>

              {/* Spots Available */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Spots Available</span>
                  <span className="font-medium text-gray-900">
                    {currentAttendees} / {maxAttendees}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      spotsLeft <= 10 ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${maxAttendees > 0 ? ((maxAttendees - spotsLeft) / maxAttendees) * 100 : 0}%` }}
                  />
                </div>
                {spotsLeft <= 10 && spotsLeft > 0 && (
                  <p className="text-sm text-red-600 mt-2">Only {spotsLeft} spots left!</p>
                )}
                {isFullyBooked && (
                  <p className="text-sm text-red-600 mt-2 font-medium">Event is fully booked</p>
                )}
              </div>

              {/* Action Button - Role and Ownership Based */}
              {canManageEvent ? (
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleManageEvent}
                  >
                    Manage Event
                  </Button>
                  <p className="text-sm text-gray-500 text-center">
                    Edit event details and manage registrations
                  </p>
                </div>
              ) : user?.role === 'organizer' ? (
                <>
                  {/* Other organizers can view but not manage */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-blue-800 font-medium mb-1">
                      👁️ View Only
                    </p>
                    <p className="text-xs text-blue-600">
                      You can only manage events you created
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Registration Button for Students/Faculty/Staff */}
                  {isRegistered ? (
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800 font-medium">
                          ✓ You're registered for this event
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleUnregister}
                        loading={registering}
                      >
                        Unregister
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={handleRegister}
                      loading={registering}
                      disabled={!canRegister || isDeadlinePassed}
                    >
                      {isFullyBooked
                        ? 'Event Full'
                        : isDeadlinePassed
                        ? 'Registration Closed'
                        : 'Register Now'}
                    </Button>
                  )}

                  {!isAuthenticated && (
                    <p className="text-sm text-gray-500 text-center mt-3">
                      <Link to="/login" className="text-primary-600 hover:text-primary-700">
                        Login
                      </Link>{' '}
                      to register for this event
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Event Management Modal */}
      <Modal
        isOpen={showManageModal}
        onClose={() => setShowManageModal(false)}
        title="Manage Event"
      >
        <div className="space-y-3">
          <p className="text-gray-600 mb-4">
            Choose an action to manage <span className="font-semibold">{event?.title}</span>
          </p>

          {/* View Details */}
          <button
            onClick={() => setShowManageModal(false)}
            className="w-full flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-teal-500 transition-all group"
          >
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Eye className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-gray-900">View Details</p>
              <p className="text-sm text-gray-500">Current page - viewing event details</p>
            </div>
          </button>

          {/* Edit Event */}
          <button
            onClick={handleEditEvent}
            className="w-full flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-teal-500 transition-all group"
          >
            <div className="h-10 w-10 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200 transition-colors">
              <Edit className="h-5 w-5 text-teal-600" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-gray-900">Edit Event</p>
              <p className="text-sm text-gray-500">Update event details and settings</p>
            </div>
          </button>

          {/* View Analytics */}
          <button
            onClick={handleViewAnalytics}
            className="w-full flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-teal-500 transition-all group"
          >
            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <BarChart className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-gray-900">View Analytics</p>
              <p className="text-sm text-gray-500">See registrations and engagement stats</p>
            </div>
          </button>

          {/* Delete Event */}
          <button
            onClick={handleDeleteEvent}
            className="w-full flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-500 transition-all group"
          >
            <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-gray-900">Delete Event</p>
              <p className="text-sm text-gray-500">Permanently remove this event</p>
            </div>
          </button>

          {/* Cancel Button */}
          <button
            onClick={() => setShowManageModal(false)}
            className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default EventDetails;
