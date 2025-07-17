const mongoose = require('mongoose');

const registrantSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: String,
  email: String,
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled'],
    default: 'Confirmed',
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
});

const attendeeSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: String,
  email: String,
  checkInTime: {
    type: Date,
    default: Date.now,
  },
});

const speakerSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  title: String,
  bio: String,
  image: String,
});

const scheduleItemSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  startTime: {
    type: Date,
    required: true,
  },
  endTime: Date,
  speaker: String,
});

const eventSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    eventDate: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    organizer: {
      orgId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
      },
      name: String,
      logo: String,
    },
    capacity: {
      type: Number,
      default: 100,
    },
    category: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    price: {
      type: Number,
      default: 0,
    },
    registrationDeadline: {
      type: Date,
    },
    speakers: [speakerSchema],
    schedule: [scheduleItemSchema],
    registrants: [registrantSchema],
    attendees: [attendeeSchema],
    status: {
      type: String,
      enum: ['draft', 'active', 'cancelled', 'completed'],
      default: 'active',
    },
    views: {
      type: Number,
      default: 0,
    },
    lastViewed: {
      type: Date,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
