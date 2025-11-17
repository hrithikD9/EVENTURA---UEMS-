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
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 animate-fade-in">
              Welcome to Eventura
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Discover, connect, and participate in exciting university events
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/events" className="btn bg-white text-primary-600 hover:bg-gray-100">
                Explore Events
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/organizations" className="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600">
                View Organizations
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-center mb-12">
            Why Choose Eventura?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-display font-bold">Featured Events</h2>
            <Link
              to="/events"
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
            >
              View All
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-display font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join Eventura today and never miss an exciting campus event again!
          </p>
          <Link to="/register" className="btn btn-primary text-lg">
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
