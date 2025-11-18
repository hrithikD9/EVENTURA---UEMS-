import { Link } from 'react-router-dom';
import { Calendar, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import EventCard from '@/components/events/EventCard';
import Loader from '@/components/common/Loader';

const Home = () => {
  const { featuredEvents, loading } = useEvents();

  const features = [
    {
      icon: Calendar,
      title: 'Discover Events',
      description: 'Browse upcoming events by category, date, or organization',
    },
    {
      icon: Users,
      title: 'Connect with Clubs',
      description: 'Explore university clubs and student organizations',
    },
    {
      icon: TrendingUp,
      title: 'Track Your Events',
      description: 'Manage your registrations and attendance history',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 text-white bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-6 text-4xl font-bold md:text-6xl font-display animate-fade-in">
              Welcome to Eventura
            </h1>
            <p className="max-w-3xl mx-auto mb-8 text-xl md:text-2xl text-primary-100">
              Discover, connect, and participate in exciting university events
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link to="/events" className="bg-white btn text-primary-600 hover:bg-gray-100">
                Explore Events
              </Link>
              <Link to="/organizations" className="text-white border-white btn btn-outline hover:bg-white hover:text-primary-600">
                View Organizations
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h2 className="mb-12 text-3xl font-bold text-center font-display">
            Why Choose Eventura?
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 transition-all bg-white shadow-md rounded-xl hover:shadow-xl"
              >
                <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-primary-100">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold font-display">Featured Events</h2>
            <Link
              to="/events"
              className="flex items-center font-medium text-primary-600 hover:text-primary-700"
            >
              View All
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-50">
        <div className="max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold font-display">
            Ready to Get Started?
          </h2>
          <p className="mb-8 text-xl text-gray-600">
            Join Eventura today and never miss an exciting campus event again!
          </p>
          <Link to="/register" className="text-lg btn btn-primary">
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
