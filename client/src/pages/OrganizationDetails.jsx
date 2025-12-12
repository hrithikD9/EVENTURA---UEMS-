import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  Mail,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { organizationService } from '@/services/organizationService';
import { eventService } from '@/services/eventService';
import EventCard from '@/components/events/EventCard';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const OrganizationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [organization, setOrganization] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    fetchOrganizationDetails();
    checkMembershipStatus();
  }, [id]);

  const fetchOrganizationDetails = async () => {
    setLoading(true);
    try {
      const response = await organizationService.getOrganizationById(id);
      const orgData = response.data || {};
      setOrganization(orgData);

      // Fetch organization's events
      if (orgData.upcomingEvents && orgData.upcomingEvents.length > 0) {
        const eventPromises = orgData.upcomingEvents.map((eventId) =>
          eventService.getEventById(eventId).catch(() => null)
        );
        const eventResults = await Promise.all(eventPromises);
        setEvents(eventResults.filter((event) => event !== null));
      }
    } catch (error) {
      toast.error('Failed to load organization details');
      console.error('Error fetching organization:', error);
      setOrganization({});
    } finally {
      setLoading(false);
    }
  };

  const checkMembershipStatus = () => {
    const memberships = JSON.parse(localStorage.getItem('organizationMemberships') || '{}');
    setIsMember(memberships[id] === true);
  };

  const handleJoinOrganization = async () => {
    setJoining(true);
    try {
      // Simulate joining organization (since backend may not have this endpoint)
      const memberships = JSON.parse(localStorage.getItem('organizationMemberships') || '{}');
      memberships[id] = true;
      localStorage.setItem('organizationMemberships', JSON.stringify(memberships));
      
      setIsMember(true);
      toast.success(`Successfully joined ${organization.name}!`);
    } catch (error) {
      toast.error('Failed to join organization');
      console.error('Error joining organization:', error);
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveOrganization = async () => {
    setJoining(true);
    try {
      const memberships = JSON.parse(localStorage.getItem('organizationMemberships') || '{}');
      delete memberships[id];
      localStorage.setItem('organizationMemberships', JSON.stringify(memberships));
      
      setIsMember(false);
      toast.success(`Left ${organization.name}`);
    } catch (error) {
      toast.error('Failed to leave organization');
      console.error('Error leaving organization:', error);
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Organization Not Found</h2>
          <p className="text-gray-600 mb-6">The organization you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/organizations')}>Back to Organizations</Button>
        </div>
      </div>
    );
  }

  const socialLinks = [
    {
      name: 'Facebook',
      url: organization.socialMedia?.facebook,
      icon: Facebook,
      color: 'text-blue-600',
    },
    {
      name: 'Twitter',
      url: organization.socialMedia?.twitter,
      icon: Twitter,
      color: 'text-sky-500',
    },
    {
      name: 'Instagram',
      url: organization.socialMedia?.instagram,
      icon: Instagram,
      color: 'text-pink-600',
    },
  ].filter((link) => link.url);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="relative h-64 md:h-96 overflow-hidden">
        <img
          src={organization.coverImage}
          alt={organization.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 flex items-center bg-white/90 hover:bg-white text-gray-900 px-4 py-2 rounded-lg transition-colors shadow-lg"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>
      </div>

      <div className="container mx-auto px-4 pb-12">
        {/* Organization Header */}
        <div className="bg-white rounded-xl shadow-sm -mt-20 relative z-10 mb-8">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Logo */}
              <div className="h-24 w-24 md:h-32 md:w-32 flex-shrink-0 bg-white rounded-xl p-2 shadow-lg">
                <img
                  src={organization.logo}
                  alt={organization.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

              {/* Info */}
              <div className="flex-1">
                <span className="badge badge-primary mb-2">{organization.type}</span>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2">
                  {organization.name}
                </h1>
                <p className="text-gray-600 text-lg mb-4">{organization.description}</p>

                {/* Stats */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-2 text-teal-600" />
                    <span className="font-medium">{organization.members?.total || organization.members?.executives?.length || 0}</span>
                    <span className="ml-1">members</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2 text-teal-600" />
                    <span className="font-medium">{organization.eventsHosted}</span>
                    <span className="ml-1">events hosted</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium">Founded</span>
                    <span className="ml-1">{organization.founded}</span>
                  </div>
                </div>
              </div>

              {/* Contact Button */}
              <div className="flex flex-col gap-2 w-full md:w-auto">
                {organization.email && (
                  <a
                    href={`mailto:${organization.email}`}
                    className="btn btn-primary flex items-center justify-center"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Contact
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">
                About Us
              </h2>
              <p className="text-gray-700 leading-relaxed">{organization.description}</p>
            </div>

            {/* Events Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-gray-900">
                  Upcoming Events
                </h2>
                {events.length > 0 && (
                  <Link
                    to="/events"
                    className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center"
                  >
                    View all
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </Link>
                )}
              </div>

              {events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event) => (
                    <Link 
                      key={event.id} 
                      to={`/events/${event.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
                    >
                      <div className="flex gap-4">
                        {/* Event Image */}
                        <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                          <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Event Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
                              {event.title}
                            </h3>
                            <span className="badge badge-primary flex-shrink-0">
                              {event.category}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {event.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1 text-teal-600" />
                              <span>{new Date(event.date || event.eventDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1 text-teal-600" />
                              <span className="truncate">{event.location?.venue || event.location || 'TBA'}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1 text-teal-600" />
                              <span>{event.currentAttendees || event.attendees || 0}/{event.capacity || event.maxAttendees || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No upcoming events at the moment</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24 space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-display font-bold text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  {organization.email && (
                    <a
                      href={`mailto:${organization.email}`}
                      className="flex items-center text-gray-600 hover:text-teal-600 transition-colors"
                    >
                      <Mail className="h-5 w-5 mr-3 flex-shrink-0" />
                      <span className="text-sm truncate">{organization.email}</span>
                    </a>
                  )}
                  {organization.phone && (
                    <a
                      href={`tel:${organization.phone}`}
                      className="flex items-center text-gray-600 hover:text-teal-600 transition-colors"
                    >
                      <Phone className="h-5 w-5 mr-3 flex-shrink-0" />
                      <span className="text-sm">{organization.phone}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Social Media */}
              {socialLinks.length > 0 && (
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-display font-bold text-gray-900 mb-4">
                    Follow Us
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {socialLinks.map((social) => (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-center h-10 w-10 rounded-lg bg-gray-100 hover:bg-gray-200 ${social.color} transition-colors`}
                        title={social.name}
                      >
                        <social.icon className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-display font-bold text-gray-900 mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Members</span>
                    <span className="font-semibold text-gray-900">{organization.members?.total || organization.members?.executives?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Events Hosted</span>
                    <span className="font-semibold text-gray-900">{organization.eventsHosted}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Founded</span>
                    <span className="font-semibold text-gray-900">{organization.founded}</span>
                  </div>
                </div>
              </div>

              {/* Action Button - Role Based */}
              <div className="pt-6 border-t border-gray-200">
                {!isAuthenticated ? (
                  <>
                    <Button 
                      variant="primary" 
                      className="w-full"
                      onClick={() => navigate('/login')}
                    >
                      Login to Join
                    </Button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Login to become a member
                    </p>
                  </>
                ) : user?.role === 'admin' || user?.role === 'organizer' ? (
                  <>
                    <Button 
                      variant="primary" 
                      className="w-full"
                      onClick={() => navigate('/profile')}
                    >
                      Manage Organization
                    </Button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      View and manage organization settings
                    </p>
                  </>
                ) : (
                  <>
                    {isMember ? (
                      <Button 
                        variant="secondary" 
                        className="w-full"
                        onClick={handleLeaveOrganization}
                        loading={joining}
                      >
                        Leave Organization
                      </Button>
                    ) : (
                      <Button 
                        variant="primary" 
                        className="w-full"
                        onClick={handleJoinOrganization}
                        loading={joining}
                      >
                        Join Organization
                      </Button>
                    )}
                    <p className="text-xs text-gray-500 text-center mt-2">
                      {isMember 
                        ? 'You are a member of this organization' 
                        : 'Become a member and participate in events'
                      }
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationDetails;
