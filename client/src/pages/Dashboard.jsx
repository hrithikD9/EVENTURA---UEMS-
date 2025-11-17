import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  TrendingUp,
  Users,
  Award,
  Clock,
  MapPin,
  Plus,
  ArrowRight,
  Bell,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { eventService } from '@/services/eventService';
import EventCard from '@/components/events/EventCard';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import { formatDate } from '@/utils/helpers';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    attendedEvents: 0,
    certificates: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Get user's registered events
      const registrations = JSON.parse(localStorage.getItem('eventRegistrations') || '{}');
      const registeredEventIds = Object.keys(registrations).filter(
        (eventId) => registrations[eventId] === user?.email
      );

      if (registeredEventIds.length > 0) {
        const eventPromises = registeredEventIds.map((eventId) =>
          eventService.getEventById(eventId).catch(() => null)
        );
        const events = (await Promise.all(eventPromises)).filter(e => e !== null);

        const now = new Date();
        const upcoming = events.filter(e => new Date(e.date) >= now);
        const past = events.filter(e => new Date(e.date) < now);

        setStats({
          totalEvents: events.length,
          upcomingEvents: upcoming.length,
          attendedEvents: past.length,
          certificates: past.length, // Assume certificates for all attended events
        });

        // Get next 3 upcoming events
        setUpcomingEvents(
          upcoming
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 3)
        );

        // Mock recent activity
        setRecentActivity([
          {
            id: 1,
            type: 'registration',
            message: `Registered for "${events[0]?.title || 'an event'}"`,
            time: '2 hours ago',
            icon: CheckCircle,
            color: 'text-green-600',
          },
          {
            id: 2,
            type: 'reminder',
            message: 'Event reminder set',
            time: '1 day ago',
            icon: Bell,
            color: 'text-blue-600',
          },
          {
            id: 3,
            type: 'certificate',
            message: 'Certificate earned',
            time: '3 days ago',
            icon: Award,
            color: 'text-yellow-600',
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Here's what's happening with your events
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.totalEvents}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Total Events</h3>
            <p className="text-sm text-gray-500 mt-1">All time registrations</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.upcomingEvents}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Upcoming Events</h3>
            <p className="text-sm text-gray-500 mt-1">Events you'll attend</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.attendedEvents}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Attended Events</h3>
            <p className="text-sm text-gray-500 mt-1">Events you've joined</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.certificates}</span>
            </div>
            <h3 className="text-gray-600 font-medium">Certificates</h3>
            <p className="text-sm text-gray-500 mt-1">Earned achievements</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  to="/events"
                  className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all group"
                >
                  <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-primary-200">
                    <Calendar className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Browse Events</h3>
                    <p className="text-sm text-gray-500">Find new events</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600" />
                </Link>

                <Link
                  to="/my-events"
                  className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-secondary-500 hover:bg-secondary-50 transition-all group"
                >
                  <div className="h-12 w-12 bg-secondary-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-secondary-200">
                    <Users className="h-6 w-6 text-secondary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">My Events</h3>
                    <p className="text-sm text-gray-500">Manage registrations</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-secondary-600" />
                </Link>

                <Link
                  to="/organizations"
                  className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
                >
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-200">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Organizations</h3>
                    <p className="text-sm text-gray-500">Explore clubs</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600" />
                </Link>

                <Link
                  to="/create-event"
                  className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all group"
                >
                  <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-yellow-200">
                    <Plus className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Create Event</h3>
                    <p className="text-sm text-gray-500">Organize new event</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-yellow-600" />
                </Link>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-gray-900">
                  Upcoming Events
                </h2>
                <Link
                  to="/my-events"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                >
                  View all
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>

              {upcomingEvents.length > 0 ? (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id}>
                      <EventCard event={event} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No upcoming events</p>
                  <Link to="/events">
                    <Button variant="primary">Browse Events</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile Card */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center mb-4">
                <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center text-primary-600 font-bold text-2xl mr-4">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{user?.name || 'User'}</h3>
                  <p className="text-primary-100 text-sm">{user?.email}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-primary-400">
                <p className="text-sm mb-1">Department</p>
                <p className="font-medium">{user?.department || 'Not specified'}</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-display font-bold text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start">
                      <div className={`h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3 flex-shrink-0 ${activity.color}`}>
                        <activity.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-medium truncate">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>

            {/* Tips Card */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
              <div className="flex items-start">
                <div className="h-10 w-10 bg-yellow-400 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">💡 Pro Tip</h3>
                  <p className="text-sm text-gray-600">
                    Attend events regularly to earn certificates and boost your profile!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
