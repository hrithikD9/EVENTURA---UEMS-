import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, Settings } from 'lucide-react';
import { formatDate } from '@/utils/helpers';

const EventCard = ({ event, showManage = false }) => {
  const isEventFull = event.attendees >= event.maxAttendees;

  return (
    <Link to={`/events/${event.id}`} className="block">
      <div className="card hover:scale-105">
        {/* Event Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.image || event.images?.banner?.url || event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4">
            {showManage ? (
              <span className="badge bg-purple-600 text-white flex items-center gap-1">
                <Settings className="h-3 w-3" />
                Manage Event
              </span>
            ) : (
              <span className={`badge ${
                isEventFull ? 'badge-danger' : 'badge-success'
              }`}>
                {isEventFull ? 'Full' : 'Open'}
              </span>
            )}
          </div>
          <div className="absolute top-4 left-4">
            <span className="badge badge-primary">{event.category}</span>
          </div>
        </div>

        {/* Event Content */}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
            {event.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {event.description}
          </p>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-2 text-teal-600" />
              <span>{event.date ? formatDate(event.date, 'PP') : event.eventDate ? formatDate(event.eventDate, 'PP') : 'TBA'}</span>
              <Clock className="h-4 w-4 ml-4 mr-2 text-teal-600" />
              <span>{event.time || 'TBA'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-2 text-teal-600" />
              <span>{event.location || 'TBA'}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-2 text-teal-600" />
                <span>{event.attendees || event.currentAttendees || 0} / {event.maxAttendees || event.capacity || 0} attending</span>
              </div>
              <span className="text-sm font-medium text-teal-600">
                {event.organizer?.name || event.organizer || 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
