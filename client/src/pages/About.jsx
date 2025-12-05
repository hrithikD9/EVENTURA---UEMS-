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
import { useAuth } from '@/hooks/useAuth';

// Import team member images
import teamMember1 from '@/assets/images/A.jpg';
import teamMember2 from '@/assets/images/H.jpg';
import teamMember3 from '@/assets/images/P.png';

const About = () => {
  const { isAuthenticated, user } = useAuth();
  
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
      name: 'Atqiya Anjum',
      role: 'Co-Developer',
      description: 'Ensuring quality events and experiences',
      image: teamMember1,
    },
    {
      name: 'Hrithik Dev Nath',
      role: 'Lead Developer',
      description: 'Building the future of campus event management',
      image: teamMember2,
    },
    {
      name: 'Priya Das',
      role: 'Co-Developer',
      description: 'Creating seamless user experiences',
      image: teamMember3,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="py-20 text-white bg-gradient-to-br from-teal-600 via-teal-700 to-blue-600">
        <div className="container px-4 mx-auto text-center">
          <h1 className="mb-6 text-5xl font-bold md:text-6xl font-display">
            About Eventura
          </h1>
          <p className="max-w-3xl mx-auto mb-8 text-xl md:text-2xl text-teal-100">
            Your gateway to an enriched university experience through seamless event discovery and management
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/events">
              <Button variant="secondary" className="bg-white text-teal-600 hover:bg-gray-100">
                Explore Events
              </Button>
            </Link>
            {!isAuthenticated ? (
              <Link to="/register">
                <Button variant="outline" className="text-white border-white hover:bg-white/10">
                  Join Us Today
                </Button>
              </Link>
            ) : user?.type === 'organizer' ? (
              <Link to="/dashboard">
                <Button variant="outline" className="text-white border-white hover:bg-white/10">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/my-events">
                <Button variant="outline" className="text-white border-white hover:bg-white/10">
                  My Events
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-teal-100">
                  <stat.icon className="w-8 h-8 text-teal-600" />
                </div>
                <div className="mb-2 text-4xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What is Eventura */}
      <div className="py-16 bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="mb-6 text-4xl font-bold text-center text-gray-900 font-display">
              What is Eventura?
            </h2>
            <p className="mb-6 text-lg leading-relaxed text-gray-600">
              Eventura is North East University Bangladesh's comprehensive event management system designed
              to bridge the gap between students and campus activities. We believe that university life
              extends far beyond the classroom, and our platform makes it easy for students to discover,
              register for, and participate in events that match their interests.
            </p>
            <p className="text-lg leading-relaxed text-gray-600">
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
        <div className="container px-4 mx-auto">
          <h2 className="mb-4 text-4xl font-bold text-center text-gray-900 font-display">
            Platform Features
          </h2>
          <p className="max-w-2xl mx-auto mb-12 text-center text-gray-600">
            Everything you need to stay connected with campus life
          </p>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} className="p-6 transition-shadow bg-gray-50 rounded-xl hover:shadow-lg">
                <div className={`inline-flex items-center justify-center w-12 h-12 ${feature.color} rounded-lg mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission, Vision, Values */}
      <div className="py-16 bg-gray-50">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {values.map((value, index) => (
              <div key={index} className="p-8 text-center bg-white shadow-sm rounded-xl">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-gradient-to-br from-teal-500 to-blue-500">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="mb-4 text-2xl font-bold text-gray-900">{value.title}</h3>
                <p className="leading-relaxed text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <h2 className="mb-12 text-4xl font-bold text-center text-gray-900 font-display">
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
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mr-6 text-xl font-bold text-white rounded-full bg-teal-600">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-bold text-gray-900">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                  <CheckCircle className="w-6 h-6 ml-4 text-green-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-gray-50">
        <div className="container px-4 mx-auto">
          <h2 className="mb-4 text-4xl font-bold text-center text-gray-900 font-display">
            The Team
          </h2>
          <p className="max-w-2xl mx-auto mb-12 text-center text-gray-600">
            Dedicated professionals working to enhance your campus experience
          </p>
          <div className="grid max-w-5xl grid-cols-1 gap-8 mx-auto md:grid-cols-3">
            {team.map((member, index) => (
              <div key={index} className="p-6 text-center transition-shadow bg-white shadow-sm rounded-xl hover:shadow-lg">
                <div className="w-24 h-24 mx-auto mb-4 overflow-hidden border-4 rounded-full border-teal-100">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div 
                    className="w-full h-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-2xl"
                    style={{display: 'none'}}
                  >
                    {member.name.charAt(0)}
                  </div>
                </div>
                <h3 className="mb-1 text-xl font-bold text-gray-900">{member.name}</h3>
                <p className="mb-3 font-medium text-teal-600">{member.role}</p>
                <p className="text-sm text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 text-white bg-gradient-to-r from-teal-600 to-blue-600">
        <div className="container px-4 mx-auto text-center">
          <h2 className="mb-6 text-4xl font-bold font-display">
            Ready to Get Started?
          </h2>
          <p className="max-w-2xl mx-auto mb-8 text-xl text-teal-100">
            Join thousands of students already using Eventura to enhance their university experience
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link to="/register">
                  <Button variant="secondary" className="bg-white text-teal-600 hover:bg-gray-100">
                    Create Account
                  </Button>
                </Link>
                <Link to="/events">
                  <Button variant="outline" className="text-white border-white hover:bg-white/10">
                    Browse Events
                  </Button>
                </Link>
              </>
            ) : user?.type === 'organizer' ? (
              <>
                <Link to="/dashboard">
                  <Button variant="secondary" className="bg-white text-teal-600 hover:bg-gray-100">
                    Go to Dashboard
                  </Button>
                </Link>
                <Link to="/create-event">
                  <Button variant="outline" className="text-white border-white hover:bg-white/10">
                    Create Event
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/my-events">
                  <Button variant="secondary" className="bg-white text-teal-600 hover:bg-gray-100">
                    My Events
                  </Button>
                </Link>
                <Link to="/events">
                  <Button variant="outline" className="text-white border-white hover:bg-white/10">
                    Browse Events
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
