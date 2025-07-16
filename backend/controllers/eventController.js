const Event = require('../models/eventModel');
const User = require('../models/userModel');

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
      status = 'active'
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
    });

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

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({}).populate('organizer', 'name organizationInfo.orgName');
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
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if student is already participating
    const alreadyJoined = event.participants.includes(req.user._id);

    if (alreadyJoined) {
      return res.status(400).json({ message: 'You have already joined this event' });
    }

    event.participants.push(req.user._id);
    await event.save();

    res.json({ message: 'Successfully joined the event' });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

module.exports = { createEvent, getEvents, getEventById, joinEvent, getOrganizerEvents };
