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
} from 'lucide-react';
import { eventService } from '@/services/eventService';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
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

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const data = await eventService.getEventById(id);
      setEvent(data);
      
      // Check if user is already registered
      if (isAuthenticated && data) {
        const registrations = JSON.parse(localStorage.getItem('eventRegistrations') || '{}');
        setIsRegistered(registrations[data.id] === user?.email);
      }
    } catch (error) {
      toast.error('Failed to load event details');
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
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

  const spotsLeft = event.maxAttendees - event.attendees;
  const isFullyBooked = spotsLeft <= 0;
  const isDeadlinePassed = new Date(event.registrationDeadline) < new Date();
  const canRegister = !isFullyBooked && !isDeadlinePassed && !isRegistered;

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
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                  <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
                    {event.title}
                  </h1>
                  <div className="flex items-center text-gray-600">
                    <Tag className="h-4 w-4 mr-2" />
                    <span className="text-sm">{event.category}</span>
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
                    <p className="font-medium text-gray-900">{formatDate(event.date)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-medium text-gray-900">{formatTime(event.time)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Attendees</p>
                    <p className="font-medium text-gray-900">
                      {event.attendees} / {event.maxAttendees}
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
                        <span className="text-sm font-medium text-gray-700">{speaker}</span>
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
                        #{tag}
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
                  to={`/organizations/${event.organizerId}`}
                  className="flex items-center group"
                >
                  <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                    {event.organizer.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                      {event.organizer}
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
                    {spotsLeft} / {event.maxAttendees}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      spotsLeft <= 10 ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(spotsLeft / event.maxAttendees) * 100}%` }}
                  />
                </div>
                {spotsLeft <= 10 && spotsLeft > 0 && (
                  <p className="text-sm text-red-600 mt-2">Only {spotsLeft} spots left!</p>
                )}
                {isFullyBooked && (
                  <p className="text-sm text-red-600 mt-2 font-medium">Event is fully booked</p>
                )}
              </div>

              {/* Registration Button */}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
