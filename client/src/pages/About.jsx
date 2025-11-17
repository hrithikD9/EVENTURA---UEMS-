import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  Building,
  Award,
  Target,
  Heart,
  Zap,
  Shield,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';
import Button from '@/components/common/Button';

const About = () => {
  const features = [
    {
      icon: Calendar,
      title: 'Event Management',
      description: 'Create, manage, and discover campus events all in one place',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Users,
      title: 'Student Organizations',
      description: 'Connect with clubs and societies that match your interests',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: Award,
      title: 'Certificates',
      description: 'Earn certificates for attending and participating in events',
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: 'Your data is safe with our secure authentication system',
      color: 'bg-green-100 text-green-600',
    },
  ];

  const stats = [
    { label: 'Active Students', value: '2,500+', icon: Users },
    { label: 'Events Hosted', value: '150+', icon: Calendar },
    { label: 'Organizations', value: '25+', icon: Building },
    { label: 'Certificates Issued', value: '1,000+', icon: Award },
  ];

  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description:
        'To create a vibrant campus community by connecting students with engaging events and opportunities for growth.',
    },
    {
      icon: Heart,
      title: 'Our Vision',
      description:
        'A campus where every student finds their place, discovers their passion, and builds lasting connections.',
    },
    {
      icon: Zap,
      title: 'Our Values',
      description:
        'Innovation, inclusivity, and excellence drive everything we do to enhance student life.',
    },
  ];

  const team = [
    {
      name: 'Development Team',
      role: 'Platform Creators',
      description: 'Building the future of campus event management',
    },
    {
      name: 'Student Affairs',
      role: 'Content Curators',
      description: 'Ensuring quality events and experiences',
    },
    {
      name: 'IT Department',
      role: 'Technical Support',
      description: 'Keeping the platform running smoothly',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
            About Eventura
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Your gateway to an enriched university experience through seamless event discovery and management
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/events">
              <Button variant="secondary" className="bg-white text-primary-600 hover:bg-gray-100">
                Explore Events
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                Join Us Today
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <stat.icon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What is Eventura */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-6 text-center">
              What is Eventura?
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Eventura is North East University Bangladesh's comprehensive event management system designed
              to bridge the gap between students and campus activities. We believe that university life
              extends far beyond the classroom, and our platform makes it easy for students to discover,
              register for, and participate in events that match their interests.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Whether you're looking to attend tech talks, join sports competitions, experience cultural
              festivals, or participate in workshops, Eventura brings all campus events to your fingertips.
              Our platform empowers student organizations to reach wider audiences while giving students a
              centralized hub for their university experience.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-display font-bold text-gray-900 mb-4 text-center">
            Platform Features
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Everything you need to stay connected with campus life
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className={`inline-flex items-center justify-center w-12 h-12 ${feature.color} rounded-lg mb-4`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission, Vision, Values */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mb-6">
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-display font-bold text-gray-900 mb-12 text-center">
            How It Works
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {[
                {
                  step: '1',
                  title: 'Create Your Account',
                  description: 'Sign up with your university email to get started',
                },
                {
                  step: '2',
                  title: 'Discover Events',
                  description: 'Browse events by category, date, or organization',
                },
                {
                  step: '3',
                  title: 'Register & Attend',
                  description: 'Register for events with one click and attend',
                },
                {
                  step: '4',
                  title: 'Earn Certificates',
                  description: 'Collect certificates and build your profile',
                },
              ].map((item, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl mr-6">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-green-500 ml-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-display font-bold text-gray-900 mb-4 text-center">
            Our Team
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Dedicated professionals working to enhance your campus experience
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                  {member.name.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-primary-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-display font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students already using Eventura to enhance their university experience
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/register">
              <Button variant="secondary" className="bg-white text-primary-600 hover:bg-gray-100">
                Create Account
              </Button>
            </Link>
            <Link to="/events">
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                Browse Events
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
