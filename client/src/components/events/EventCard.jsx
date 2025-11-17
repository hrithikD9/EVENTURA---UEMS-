import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { formatDate } from '@/utils/helpers';

const EventCard = ({ event }) => {
  const isEventFull = event.attendees >= event.maxAttendees;

  return (
    <Link to={`/events/${event.id}`} className="block">
      <div className="card hover:scale-105">
        {/* Event Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4">
            <span className={`badge ${
              isEventFull ? 'badge-danger' : 'badge-success'
            }`}>
              {isEventFull ? 'Full' : 'Open'}
            </span>
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
              <Calendar className="h-4 w-4 mr-2 text-primary-600" />
              <span>{formatDate(event.date, 'PP')}</span>
              <Clock className="h-4 w-4 ml-4 mr-2 text-primary-600" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="h-4 w-4 mr-2 text-primary-600" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-2 text-primary-600" />
                <span>{event.attendees} / {event.maxAttendees} attending</span>
              </div>
              <span className="text-sm font-medium text-primary-600">
                {event.organizer}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
