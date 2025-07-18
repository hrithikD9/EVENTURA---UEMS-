const Event = require('../models/eventModel');
const User = require('../models/userModel');
const realtimeService = require('../services/realtimeService');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Organizer
const createEvent = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      eventDate, 
      location, 
      capacity, 
      category, 
      status = 'active',
      price,
      registrationDeadline,
      speakers,
      schedule,
      image
    } = req.body;

    // Check if organizer has completed onboarding
    const organizer = await User.findById(req.user._id);
    if (organizer.organizationInfo && organizer.organizationInfo.isOnboardingComplete === false) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please complete onboarding before creating events' 
      });
    }

    // Create organizer object with name and ID
    const organizerObj = {
      orgId: organizer.organizationInfo?._id || organizer._id,
      name: organizer.name,
      logo: organizer.organizationInfo?.logo || ''
    };

    const event = await Event.create({
      title,
      description,
      eventDate,
      location,
      capacity: parseInt(capacity) || 100,
      category,
      status,
      organizer: organizerObj,
      price: parseFloat(price) || 0,
      registrationDeadline: registrationDeadline || eventDate,
      speakers,
      schedule,
      image
    });

    // Emit real-time notification about new event
    realtimeService.notifyNewEvent(event);
    
    // Notify the organizer's followers about the new event
    if (organizer.followers && organizer.followers.length > 0) {
      for (const followerId of organizer.followers) {
        realtimeService.notifyUser(followerId, {
          type: 'new-event',
          title: 'New Event Created',
          message: `${organizer.name} created a new event: ${title}`,
          eventId: event._id
        });
      }
    }

    res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully'
    });
  } catch (error) {
    console.error('Error in createEvent controller:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Get all events with filtering and pagination
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filterObj = {};
    
    // Category filter
    if (req.query.category) {
      filterObj.category = req.query.category;
    }
    
    // Organization filter
    if (req.query.organization) {
      filterObj['organizer.name'] = { $regex: req.query.organization, $options: 'i' };
    }
    
    // Venue/Location filter
    if (req.query.venue) {
      filterObj.location = { $regex: req.query.venue, $options: 'i' };
    }
    
    // Date filter
    if (req.query.date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const thisWeekend = new Date(today);
      thisWeekend.setDate(thisWeekend.getDate() + (6 - today.getDay())); // Saturday
      
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      switch (req.query.date) {
        case 'today':
          filterObj.eventDate = { $gte: today, $lt: tomorrow };
          break;
        case 'tomorrow':
          filterObj.eventDate = { $gte: tomorrow, $lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000) };
          break;
        case 'this-week':
          filterObj.eventDate = { $gte: today, $lt: nextWeek };
          break;
        case 'this-weekend':
          filterObj.eventDate = { $gte: thisWeekend, $lt: new Date(thisWeekend.getTime() + 2 * 24 * 60 * 60 * 1000) };
          break;
        case 'next-week':
          filterObj.eventDate = { $gte: nextWeek, $lt: new Date(nextWeek.getTime() + 7 * 24 * 60 * 60 * 1000) };
          break;
        case 'this-month':
          filterObj.eventDate = { $gte: today, $lt: nextMonth };
          break;
        default:
          break;
      }
    }
    
    // Search query (searches in title and description)
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      filterObj.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
        { 'organizer.name': searchRegex }
      ];
    }
    
    // Only show active events by default
    if (!filterObj.status) {
      filterObj.status = 'active';
    }

    // Count total documents for pagination
    const count = await Event.countDocuments(filterObj);
    
    // Get events with pagination
    const events = await Event.find(filterObj)
      .sort({ eventDate: 1 }) // Sort by date ascending (upcoming first)
      .skip(skip)
      .limit(limit);
    
    res.json({
      success: true,
      data: events,
      count: events.length,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name organizationInfo.orgName');

    if (event) {
      // Track view
      event.views = (event.views || 0) + 1;
      event.lastViewed = new Date();
      await event.save();
      
      res.json({
        success: true,
        data: event
      });
    } else {
      res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Join an event
// @route   PUT /api/events/:id/join
// @access  Private/Student
const joinEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    // Get the user
    const user = await User.findById(req.user._id);

    // Check if user is already registered
    const alreadyRegistered = user.registeredEvents.some(
      reg => reg.eventId.toString() === event._id.toString()
    );

    if (alreadyRegistered) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already registered for this event' 
      });
    }

    // Add to event registrants
    const newRegistrant = {
      userId: user._id,
      name: user.name,
      email: user.email,
      status: 'Confirmed'
    };
    
    event.registrants.push(newRegistrant);
    await event.save();

    // Add to user's registered events
    user.registeredEvents.push({
      eventId: event._id,
      status: 'registered',
      registeredAt: new Date()
    });
    
    await user.save();
    
    // Emit real-time updates
    realtimeService.notifyEventCapacityChange(event, user);
    
    // Notify event organizer
    if (event.organizer && event.organizer.orgId) {
      // Find the organizer user
      const organizer = await User.findOne({ 'organizationInfo._id': event.organizer.orgId });
      if (organizer) {
        realtimeService.notifyUser(organizer._id, {
          type: 'event-registration',
          title: 'New Event Registration',
          message: `${user.name} has registered for your event: ${event.title}`,
          eventId: event._id
        });
      }
    }

    res.json({ 
      success: true,
      message: 'Successfully registered for the event',
      data: {
        eventId: event._id,
        title: event.title,
        registrationDate: new Date()
      }
    });
  } catch (error) {
    console.error('Error joining event:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get organizer's events
// @route   GET /api/events/myevents
// @access  Private/Organizer
const getOrganizerEvents = async (req, res) => {
  try {
    const events = await Event.find({ 'organizer.name': req.user.name });
    res.json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get user's registered events
// @route   GET /api/events/user/registered
// @access  Private
const getUserEvents = async (req, res) => {
  try {
    // Find the user with their registered events
    const user = await User.findById(req.user._id).select('registeredEvents');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get the event IDs from the user's registeredEvents array
    const eventIds = user.registeredEvents.map(registration => registration.eventId);
    
    // Find all events that the user has registered for
    const events = await Event.find({ _id: { $in: eventIds } });
    
    // Map events to include registration status and date
    const eventsWithRegistrationDetails = events.map(event => {
      // Find the registration details for this event
      const registration = user.registeredEvents.find(
        reg => reg.eventId.toString() === event._id.toString()
      );
      
      return {
        ...event.toObject(),
        registrationStatus: registration.status,
        registrationDate: registration.registeredAt
      };
    });
    
    res.json({
      success: true,
      data: eventsWithRegistrationDetails,
      count: eventsWithRegistrationDetails.length
    });
  } catch (error) {
    console.error('Error fetching user events:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { createEvent, getEvents, getEventById, joinEvent, getOrganizerEvents, getUserEvents };
