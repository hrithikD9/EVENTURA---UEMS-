import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide event title'],
    trim: true,
    maxLength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide event description'],
    maxLength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Technology',
      'Sports',
      'Cultural',
      'Workshop',
      'Competition',
      'Seminar',
      'Conference',
      'Social',
      'Academic',
      'Other'
    ]
  },
  date: {
    type: Date,
    required: [true, 'Please provide event date'],
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  time: {
    type: String,
    required: [true, 'Please provide event time'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time in HH:MM format']
  },
  duration: {
    hours: {
      type: Number,
      min: [0, 'Duration hours cannot be negative'],
      max: [24, 'Duration hours cannot exceed 24']
    },
    minutes: {
      type: Number,
      min: [0, 'Duration minutes cannot be negative'],
      max: [59, 'Duration minutes cannot exceed 59']
    }
  },
  location: {
    type: String,
    required: [true, 'Please provide event location'],
    trim: true,
    maxLength: [100, 'Location cannot exceed 100 characters']
  },
  venue: {
    type: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
      default: 'offline'
    },
    onlineLink: {
      type: String,
      required: function() {
        return this.venue.type === 'online' || this.venue.type === 'hybrid';
      },
      match: [/^https?:\/\/.+/, 'Please provide a valid URL']
    }
  },
  maxAttendees: {
    type: Number,
    required: [true, 'Please specify maximum attendees'],
    min: [1, 'Maximum attendees must be at least 1'],
    max: [10000, 'Maximum attendees cannot exceed 10000']
  },
  currentAttendees: {
    type: Number,
    default: 0,
    min: [0, 'Current attendees cannot be negative']
  },
  registrationDeadline: {
    type: Date,
    required: [true, 'Please provide registration deadline'],
    validate: {
      validator: function(deadline) {
        return deadline < this.date;
      },
      message: 'Registration deadline must be before event date'
    }
  },
  organizer: {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    organization: String
  },
  speakers: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    bio: String,
    image: {
      public_id: String,
      url: String
    },
    linkedin: String,
    twitter: String
  }],
  images: {
    banner: {
      public_id: String,
      url: {
        type: String,
        default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
      }
    },
    gallery: [{
      public_id: String,
      url: String,
      caption: String
    }]
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  agenda: [{
    time: {
      type: String,
      required: true,
      match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time in HH:MM format']
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    speaker: String
  }],
  registeredUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    attended: {
      type: Boolean,
      default: false
    },
    checkInTime: Date,
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        maxLength: [500, 'Feedback cannot exceed 500 characters']
      },
      submittedAt: Date
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'active', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  fees: {
    amount: {
      type: Number,
      min: [0, 'Fee amount cannot be negative'],
      default: 0
    },
    currency: {
      type: String,
      default: 'BDT'
    },
    type: {
      type: String,
      enum: ['free', 'paid'],
      default: 'free'
    }
  },
  certificates: {
    enabled: {
      type: Boolean,
      default: false
    },
    template: {
      public_id: String,
      url: String
    },
    criteria: {
      attendanceRequired: {
        type: Boolean,
        default: true
      },
      minimumAttendancePercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 80
      }
    }
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    registrations: {
      type: Number,
      default: 0
    },
    attendance: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5
    },
    totalFeedbacks: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ category: 1, status: 1 });
eventSchema.index({ 'organizer.user': 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ createdAt: -1 });
eventSchema.index({ title: 'text', description: 'text' }); // Text search index

// Virtual for available slots
eventSchema.virtual('availableSlots').get(function() {
  return this.maxAttendees - this.currentAttendees;
});

// Virtual for registration status
eventSchema.virtual('registrationStatus').get(function() {
  const now = new Date();
  if (now > this.registrationDeadline) return 'closed';
  if (this.currentAttendees >= this.maxAttendees) return 'full';
  return 'open';
});

// Virtual for event status based on date
eventSchema.virtual('eventStatus').get(function() {
  const now = new Date();
  const eventDate = new Date(this.date);
  
  if (this.status === 'cancelled') return 'cancelled';
  if (eventDate < now) return 'completed';
  if (eventDate.toDateString() === now.toDateString()) return 'ongoing';
  return 'upcoming';
});

// Pre-save middleware to update analytics
eventSchema.pre('save', function(next) {
  if (this.isModified('registeredUsers')) {
    this.analytics.registrations = this.registeredUsers.length;
    this.currentAttendees = this.registeredUsers.length;
    
    // Calculate attendance
    const attendedCount = this.registeredUsers.filter(reg => reg.attended).length;
    this.analytics.attendance = attendedCount;
    
    // Calculate average rating
    const feedbacks = this.registeredUsers.filter(reg => reg.feedback && reg.feedback.rating);
    if (feedbacks.length > 0) {
      const totalRating = feedbacks.reduce((sum, reg) => sum + reg.feedback.rating, 0);
      this.analytics.averageRating = totalRating / feedbacks.length;
      this.analytics.totalFeedbacks = feedbacks.length;
    }
  }
  next();
});

// Instance method to check if user is registered
eventSchema.methods.isUserRegistered = function(userId) {
  return this.registeredUsers.some(reg => reg.user.toString() === userId.toString());
};

// Instance method to register user
eventSchema.methods.registerUser = function(userId) {
  if (this.isUserRegistered(userId)) {
    throw new Error('User is already registered for this event');
  }
  
  if (this.currentAttendees >= this.maxAttendees) {
    throw new Error('Event is fully booked');
  }
  
  if (new Date() > this.registrationDeadline) {
    throw new Error('Registration deadline has passed');
  }
  
  this.registeredUsers.push({ user: userId });
  return this.save();
};

// Instance method to unregister user
eventSchema.methods.unregisterUser = function(userId) {
  const userIndex = this.registeredUsers.findIndex(reg => reg.user.toString() === userId.toString());
  if (userIndex === -1) {
    throw new Error('User is not registered for this event');
  }
  
  this.registeredUsers.splice(userIndex, 1);
  return this.save();
};

export default mongoose.model('Event', eventSchema);