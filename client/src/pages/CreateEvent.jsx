import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
  Tag,
  Image as ImageIcon,
  Plus,
  X,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import { eventService } from '@/services/eventService';
import toast from 'react-hot-toast';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const editEventId = searchParams.get('edit');
  const isEditMode = !!editEventId;
  
  const [loading, setLoading] = useState(false);
  const [fetchingEvent, setFetchingEvent] = useState(isEditMode);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [speakers, setSpeakers] = useState([]);
  const [speakerInput, setSpeakerInput] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    time: '',
    location: '',
    maxAttendees: '',
    registrationDeadline: '',
    imageUrl: '',
    organizer: user?.department || '',
  });
  const [errors, setErrors] = useState({});

  const categories = [
    'Technology',
    'Sports',
    'Cultural',
    'Workshop',
    'Competition',
    'Seminar',
    'Conference',
    'Social',
    'Academic',
    'Other',
  ];

  // Fetch event data if in edit mode
  useEffect(() => {
    if (isEditMode && editEventId) {
      fetchEventForEdit();
    }
  }, [isEditMode, editEventId]);

  const fetchEventForEdit = async () => {
    setFetchingEvent(true);
    try {
      const response = await eventService.getEventById(editEventId);
      const event = response.data || {};
      
      // Format date to YYYY-MM-DD for input
      const eventDate = event.date || event.eventDate;
      const formattedDate = eventDate ? new Date(eventDate).toISOString().split('T')[0] : '';
      
      // Format registration deadline
      const deadline = event.registrationDeadline;
      const formattedDeadline = deadline ? new Date(deadline).toISOString().split('T')[0] : '';
      
      setFormData({
        title: event.title || '',
        description: event.description || '',
        category: event.category || '',
        date: formattedDate,
        time: event.time || '',
        location: event.location?.venue || event.location || '',
        maxAttendees: event.maxAttendees || event.capacity || '',
        registrationDeadline: formattedDeadline,
        imageUrl: event.image || event.images?.banner?.url || event.imageUrl || '',
        organizer: event.organizer?.name || event.organizer || user?.department || '',
      });
      
      // Set tags if they exist
      if (event.tags && Array.isArray(event.tags)) {
        const tagStrings = event.tags.map(tag => 
          typeof tag === 'object' ? tag.name || tag.label || '' : tag
        ).filter(Boolean);
        setTags(tagStrings);
      }
      
      // Set speakers if they exist
      if (event.speakers && Array.isArray(event.speakers)) {
        const speakerStrings = event.speakers.map(speaker => 
          typeof speaker === 'object' ? speaker.name || speaker.title || '' : speaker
        ).filter(Boolean);
        setSpeakers(speakerStrings);
      }
      
      toast.success('Event loaded for editing');
    } catch (error) {
      toast.error('Failed to load event details');
      console.error('Error fetching event:', error);
      navigate('/my-events');
    } finally {
      setFetchingEvent(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Title validation (3-100 characters)
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }

    // Description validation (10-1000 characters)
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }

    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.date) newErrors.date = 'Date is required';
    
    // Time validation (HH:MM format)
    if (!formData.time) {
      newErrors.time = 'Time is required';
    } else if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(formData.time)) {
      newErrors.time = 'Please provide valid time in HH:MM format';
    }

    // Location validation (3-100 characters)
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    } else if (formData.location.trim().length < 3) {
      newErrors.location = 'Location must be at least 3 characters';
    } else if (formData.location.trim().length > 100) {
      newErrors.location = 'Location cannot exceed 100 characters';
    }

    // Max attendees validation (1-10000)
    if (!formData.maxAttendees) {
      newErrors.maxAttendees = 'Max attendees is required';
    } else {
      const maxAttendeesNum = parseInt(formData.maxAttendees);
      if (isNaN(maxAttendeesNum) || maxAttendeesNum < 1) {
        newErrors.maxAttendees = 'Must be at least 1';
      } else if (maxAttendeesNum > 10000) {
        newErrors.maxAttendees = 'Cannot exceed 10,000';
      }
    }

    if (!formData.registrationDeadline) {
      newErrors.registrationDeadline = 'Registration deadline is required';
    }
    if (!formData.organizer.trim()) newErrors.organizer = 'Organizer is required';

    // Date validations
    if (formData.date) {
      const eventDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (eventDate <= today) {
        newErrors.date = 'Event date must be in the future';
      }
    }

    if (formData.registrationDeadline && formData.date) {
      const deadline = new Date(formData.registrationDeadline);
      const eventDate = new Date(formData.date);
      if (deadline >= eventDate) {
        newErrors.registrationDeadline = 'Registration deadline must be before event date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleAddSpeaker = () => {
    if (speakerInput.trim() && !speakers.includes(speakerInput.trim())) {
      setSpeakers([...speakers, speakerInput.trim()]);
      setSpeakerInput('');
    }
  };

  const handleRemoveSpeaker = (speakerToRemove) => {
    setSpeakers(speakers.filter((speaker) => speaker !== speakerToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      // Convert and format data for backend validation
      const eventData = {
        ...formData,
        maxAttendees: parseInt(formData.maxAttendees), // Convert to integer
        date: new Date(formData.date).toISOString(), // Convert to ISO format
        registrationDeadline: new Date(formData.registrationDeadline).toISOString(), // Convert to ISO format
        tags,
        speakers,
        status: 'published',
        isPublic: true,
        createdBy: user?.email,
        createdById: user?.id || user?._id, // Store user ID for ownership checks
        organizerId: user?.id || user?._id,
      };

      let result;
      if (isEditMode) {
        // Update existing event
        console.log('Updating event:', eventData);
        result = await eventService.updateEvent(editEventId, eventData);
        
        if (result.success) {
          toast.success('Event updated successfully!');
          navigate(`/events/${editEventId}`);
        } else {
          toast.error('Failed to update event');
        }
      } else {
        // Create new event
        console.log('Creating event:', eventData);
        result = await eventService.createEvent(eventData);
        
        if (result.success) {
          toast.success('Event created successfully!');
          navigate('/my-events');
        } else {
          toast.error('Failed to create event');
        }
      }
    } catch (error) {
      toast.error(isEditMode ? 'Failed to update event' : 'Failed to create event');
      console.error('Error with event:', error);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingEvent) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-3">
            {isEditMode ? 'Edit Event' : 'Create New Event'}
          </h1>
          <p className="text-gray-600 text-lg">
            {isEditMode 
              ? 'Update the details below to modify your event' 
              : 'Fill in the details below to create an amazing event'
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
              Basic Information
            </h2>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.title ? 'border-red-500' : ''}`}
                    placeholder="e.g., Tech Talk: AI in Modern Development"
                  />
                </div>
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className={`input ${errors.description ? 'border-red-500' : ''}`}
                  placeholder="Provide a detailed description of your event..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.category ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
              Date & Time
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="date"
                    name="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.date ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
              </div>

              {/* Time */}
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="time"
                    name="time"
                    type="time"
                    required
                    value={formData.time}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.time ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
              </div>

              {/* Registration Deadline */}
              <div>
                <label htmlFor="registrationDeadline" className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Deadline <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="registrationDeadline"
                    name="registrationDeadline"
                    type="date"
                    required
                    value={formData.registrationDeadline}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.registrationDeadline ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.registrationDeadline && (
                  <p className="mt-1 text-sm text-red-600">{errors.registrationDeadline}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location & Capacity */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
              Location & Capacity
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="location"
                    name="location"
                    type="text"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.location ? 'border-red-500' : ''}`}
                    placeholder="e.g., Auditorium Hall A"
                  />
                </div>
                {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
              </div>

              {/* Max Attendees */}
              <div>
                <label htmlFor="maxAttendees" className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Attendees <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="maxAttendees"
                    name="maxAttendees"
                    type="number"
                    min="1"
                    required
                    value={formData.maxAttendees}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.maxAttendees ? 'border-red-500' : ''}`}
                    placeholder="e.g., 100"
                  />
                </div>
                {errors.maxAttendees && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxAttendees}</p>
                )}
              </div>

              {/* Organizer */}
              <div>
                <label htmlFor="organizer" className="block text-sm font-medium text-gray-700 mb-2">
                  Organizer <span className="text-red-500">*</span>
                </label>
                <input
                  id="organizer"
                  name="organizer"
                  type="text"
                  required
                  value={formData.organizer}
                  onChange={handleChange}
                  className={`input ${errors.organizer ? 'border-red-500' : ''}`}
                  placeholder="e.g., CSE Society"
                />
                {errors.organizer && (
                  <p className="mt-1 text-sm text-red-600">{errors.organizer}</p>
                )}
              </div>

              {/* Image URL */}
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Image URL
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="input pl-10"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
              Additional Details
            </h2>

            {/* Speakers */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Speakers</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={speakerInput}
                  onChange={(e) => setSpeakerInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpeaker())}
                  className="input flex-1"
                  placeholder="Enter speaker name and press Enter"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddSpeaker}
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {speakers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {speakers.map((speaker, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      {speaker}
                      <button
                        type="button"
                        onClick={() => handleRemoveSpeaker(speaker)}
                        className="ml-2 hover:text-blue-900"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="input flex-1"
                  placeholder="Enter tag and press Enter"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTag}
                  className="flex items-center"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 hover:text-purple-900"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              {isEditMode ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
