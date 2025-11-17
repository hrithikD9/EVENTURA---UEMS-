import { Link } from 'react-router-dom';
import { Users, Calendar, Mail } from 'lucide-react';

const OrganizationCard = ({ organization }) => {
  return (
    <Link
      to={`/organizations/${organization.id}`}
      className="card group hover:shadow-xl transition-all duration-300"
    >
      {/* Cover Image */}
      <div className="relative h-32 overflow-hidden rounded-t-xl">
        <img
          src={organization.coverImage}
          alt={organization.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Logo */}
      <div className="absolute top-20 left-4">
        <div className="h-20 w-20 rounded-xl bg-white p-1 shadow-lg">
          <img
            src={organization.logo}
            alt={organization.name}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>

      {/* Content */}
      <div className="pt-12 pb-4">
        {/* Type Badge */}
        <span className="badge badge-primary mb-2">{organization.type}</span>

        {/* Name */}
        <h3 className="text-xl font-display font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
          {organization.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {organization.description}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center text-gray-500">
            <Users className="h-4 w-4 mr-1" />
            <span className="text-sm">{organization.members} members</span>
          </div>
          <div className="flex items-center text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            <span className="text-sm">{organization.eventsHosted} events</span>
          </div>
        </div>

        {/* Contact */}
        {organization.email && (
          <div className="flex items-center text-gray-400 mt-3">
            <Mail className="h-3 w-3 mr-1" />
            <span className="text-xs truncate">{organization.email}</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default OrganizationCard;
