import Event from '../models/Event.js';
import User from '../models/User.js';

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build query
    let query = { status: { $in: ['published', 'active'] }, isPublic: true };

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate) {
        query.date.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query.date.$lte = new Date(req.query.endDate);
      }
    }

    // Search by title or description
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Filter by upcoming events only
    if (req.query.upcoming === 'true') {
      query.date = { $gte: new Date() };
    }

    const events = await Event.find(query)
      .select('-registeredUsers')
      .skip(skip)
      .limit(limit)
      .sort({ date: 1 }); // Sort by date ascending

    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      count: events.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: events
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events'
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
export const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Increment view count
    event.analytics.views += 1;
    await event.save({ validateBeforeSave: false });

    // Check if user is registered (if authenticated)
    let isRegistered = false;
    if (req.user) {
      isRegistered = event.isUserRegistered(req.user.id);
    }

    // Don't send full registered users list to public
    const eventData = event.toObject();
    if (!req.user || (req.user.id !== event.organizer.user?.toString() && req.user.role !== 'admin')) {
      eventData.registeredUsers = undefined;
    }

    res.status(200).json({
      success: true,
      data: {
        ...eventData,
        isRegistered
      }
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event'
    });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Organizer/Admin)
export const createEvent = async (req, res, next) => {
  try {
    // Add organizer information
    req.body.organizer = {
      user: req.user._id,
      name: req.user.name,
      email: req.user.email,
      organization: req.user.organizationName || req.user.department
    };

    const event = await Event.create(req.body);

    // Add event to user's created events
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { createdEvents: event._id } }
    );

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating event'
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Event Owner/Admin)
export const updateEvent = async (req, res, next) => {
  try {
    const event = req.resource; // From checkOwnership middleware

    // Don't allow updating if event has started
    if (new Date() >= new Date(event.date)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update event that has already started'
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event'
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Event Owner/Admin)
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Don't allow deleting if event has registrations (optional check)
    if (event.registeredUsers && event.registeredUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete event with existing registrations. Please cancel all registrations first.'
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting event'
    });
  }
};

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private
export const registerForEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if registration is open
    if (new Date() > event.registrationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed'
      });
    }

    // Check if event is full
    if (event.currentAttendees >= event.maxAttendees) {
      return res.status(400).json({
        success: false,
        message: 'Event is fully booked'
      });
    }

    // Check if user is already registered
    if (event.isUserRegistered(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Register user
    await event.registerUser(req.user.id);

    // Add to user's registered events
    await User.findByIdAndUpdate(
      req.user.id,
      {
        $push: {
          registeredEvents: {
            event: event._id,
            registeredAt: new Date()
          }
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Successfully registered for the event'
    });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error registering for event'
    });
  }
};

// @desc    Unregister from event
// @route   DELETE /api/events/:id/register
// @access  Private
export const unregisterFromEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event has started
    if (new Date() >= new Date(event.date)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot unregister from an event that has already started'
      });
    }

    // Check if user is registered
    if (!event.isUserRegistered(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not registered for this event'
      });
    }

    // Unregister user
    await event.unregisterUser(req.user.id);

    // Remove from user's registered events
    await User.findByIdAndUpdate(
      req.user.id,
      {
        $pull: {
          registeredEvents: { event: event._id }
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Successfully unregistered from the event'
    });
  } catch (error) {
    console.error('Unregister from event error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error unregistering from event'
    });
  }
};

// @desc    Get event registrations
// @route   GET /api/events/:id/registrations
// @access  Private (Event Owner/Admin)
export const getEventRegistrations = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .select('registeredUsers title');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      count: event.registeredUsers.length,
      data: event.registeredUsers
    });
  } catch (error) {
    console.error('Get event registrations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event registrations'
    });
  }
};

// @desc    Mark attendance
// @route   POST /api/events/:id/attendance
// @access  Private (Event Owner/Admin)
export const markAttendance = async (req, res, next) => {
  try {
    const { userId, attended } = req.body;

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Find the registered user
    const registeredUser = event.registeredUsers.find(
      reg => reg.user.toString() === userId
    );

    if (!registeredUser) {
      return res.status(404).json({
        success: false,
        message: 'User is not registered for this event'
      });
    }

    // Update attendance
    registeredUser.attended = attended;
    registeredUser.checkInTime = attended ? new Date() : null;

    await event.save();

    // Update user's registered events
    await User.findOneAndUpdate(
      { 
        '_id': userId,
        'registeredEvents.event': event._id 
      },
      { 
        $set: { 'registeredEvents.$.attended': attended }
      }
    );

    res.status(200).json({
      success: true,
      message: `Attendance ${attended ? 'marked' : 'unmarked'} successfully`
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating attendance'
    });
  }
};

// @desc    Submit feedback
// @route   POST /api/events/:id/feedback
// @access  Private
export const submitFeedback = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event has ended
    if (new Date() < new Date(event.date)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot submit feedback for a future event'
      });
    }

    // Find the registered user
    const registeredUser = event.registeredUsers.find(
      reg => reg.user.toString() === req.user.id
    );

    if (!registeredUser) {
      return res.status(404).json({
        success: false,
        message: 'You are not registered for this event'
      });
    }

    // Check if user attended the event
    if (!registeredUser.attended) {
      return res.status(400).json({
        success: false,
        message: 'You must have attended the event to submit feedback'
      });
    }

    // Check if feedback already submitted
    if (registeredUser.feedback && registeredUser.feedback.rating) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted feedback for this event'
      });
    }

    // Update feedback
    registeredUser.feedback = {
      rating,
      comment,
      submittedAt: new Date()
    };

    await event.save();

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback'
    });
  }
};

// @desc    Get featured events
// @route   GET /api/events/featured
// @access  Public
export const getFeaturedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({
      isFeatured: true,
      status: 'published',
      isPublic: true,
      date: { $gte: new Date() }
    })
      .select('-registeredUsers')
      .limit(6)
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Get featured events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured events'
    });
  }
};

// @desc    Get events by category
// @route   GET /api/events/category/:category
// @access  Public
export const getEventsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const events = await Event.find({
      category,
      status: 'published',
      isPublic: true
    })
      .select('-registeredUsers')
      .skip(skip)
      .limit(limit)
      .sort({ date: 1 });

    const total = await Event.countDocuments({
      category,
      status: 'published',
      isPublic: true
    });

    res.status(200).json({
      success: true,
      count: events.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: events
    });
  } catch (error) {
    console.error('Get events by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events by category'
    });
  }
};

// @desc    Search events
// @route   GET /api/events/search
// @access  Public
export const searchEvents = async (req, res, next) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const events = await Event.find({
      $text: { $search: q },
      status: 'published',
      isPublic: true
    })
      .select('-registeredUsers')
      .skip(skip)
      .limit(limit)
      .sort({ score: { $meta: 'textScore' } });

    const total = await Event.countDocuments({
      $text: { $search: q },
      status: 'published',
      isPublic: true
    });

    res.status(200).json({
      success: true,
      count: events.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: events
    });
  } catch (error) {
    console.error('Search events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching events'
    });
  }
};