const Event = require('../models/eventModel');
const User = require('../models/userModel');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Organizer
const createEvent = async (req, res) => {
  try {
    const { title, description, date } = req.body;

    // Check if organizer has completed onboarding
    const organizer = await User.findById(req.user._id);
    if (!organizer.organizationInfo.isOnboardingComplete) {
      return res.status(400).json({ message: 'Please complete onboarding before creating events' });
    }

    const event = await Event.create({
      title,
      description,
      date,
      organizer: req.user._id,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({}).populate('organizer', 'name organizationInfo.orgName');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name organizationInfo.orgName');

    if (event) {
      res.json(event);
    } else {
      res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    const events = await Event.find({ organizer: req.user._id });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createEvent, getEvents, getEventById, joinEvent, getOrganizerEvents };
