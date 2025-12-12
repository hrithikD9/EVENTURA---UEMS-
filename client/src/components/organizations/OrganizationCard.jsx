import { Link } from 'react-router-dom';
import { Users, Calendar, Mail } from 'lucide-react';

const OrganizationCard = ({ organization }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full min-h-[400px] flex flex-col">
      <Link
        to={`/organizations/${organization.id}`}
        className="group h-full flex flex-col"
      >
        {/* Cover Image */}
        <div className="relative h-32 overflow-hidden flex-shrink-0">
          <img
            src={organization.coverImage?.url || organization.coverImage || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800'}
            alt={organization.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Logo */}
        <div className="absolute top-20 left-4 z-10">
          <div className="h-20 w-20 rounded-xl bg-white p-1 shadow-lg">
            <img
              src={organization.logo?.url || organization.logo || 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400'}
              alt={organization.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>

        {/* Content - Uses remaining height */}
        <div className="p-6 pt-12 flex-1 flex flex-col">
          {/* Type Badge */}
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-3 w-fit">
            {organization.type}
          </span>

          {/* Name */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
            {organization.name}
          </h3>

          {/* Description - Takes available space */}
          <div className="flex-1 mb-4">
            <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
              {organization.description}
            </p>
          </div>

          {/* Stats - Always at bottom */}
          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center text-gray-500">
                <Users className="h-4 w-4 mr-1.5" />
                <span className="text-sm">
                  {organization.members?.total || organization.members?.executives?.length || 0} members
                </span>
              </div>
              <div className="flex items-center text-gray-500">
                <Calendar className="h-4 w-4 mr-1.5" />
                <span className="text-sm">
                  {organization.events?.total || organization.eventsHosted || 0} events
                </span>
              </div>
            </div>

            {/* Contact */}
            {(organization.email || organization.contactInfo?.email) && (
              <div className="flex items-center text-gray-400">
                <Mail className="h-3.5 w-3.5 mr-1.5" />
                <span className="text-xs truncate">
                  {organization.email || organization.contactInfo?.email}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default OrganizationCard;
