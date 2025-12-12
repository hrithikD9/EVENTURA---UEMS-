import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide organization name'],
    trim: true,
    unique: true,
    maxLength: [100, 'Organization name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide organization description'],
    maxLength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    required: [true, 'Please specify organization type'],
    enum: [
      'Academic Club',
      'Sports Club',
      'Cultural Club',
      'Technical Club',
      'Social Club',
      'Professional Society',
      'Student Government',
      'Volunteer Organization',
      'Special Interest Group',
      'Other'
    ]
  },
  category: {
    type: String,
    required: [true, 'Please specify organization category'],
    enum: [
      'Technology',
      'Arts & Culture',
      'Sports & Recreation',
      'Academic',
      'Social Service',
      'Professional Development',
      'Religion & Spirituality',
      'Environment',
      'Health & Wellness',
      'Other'
    ]
  },
  logo: {
    public_id: String,
    url: {
      type: String,
      default: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400'
    }
  },
  coverImage: {
    public_id: String,
    url: {
      type: String,
      default: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800'
    }
  },
  contact: {
    email: {
      type: String,
      required: [true, 'Please provide contact email'],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address'
      ]
    },
    phone: {
      type: String,
      match: [/^\+?[\d\s\-\(\)]+$/, 'Please provide a valid phone number']
    },
    website: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please provide a valid website URL']
    },
    address: {
      type: String,
      maxLength: [200, 'Address cannot exceed 200 characters']
    }
  },
  socialMedia: {
    facebook: {
      type: String,
      match: [/^https?:\/\/(www\.)?facebook\.com\/.+/, 'Please provide a valid Facebook URL']
    },
    instagram: {
      type: String,
      match: [/^https?:\/\/(www\.)?instagram\.com\/.+/, 'Please provide a valid Instagram URL']
    },
    twitter: {
      type: String,
      match: [/^https?:\/\/(www\.)?twitter\.com\/.+/, 'Please provide a valid Twitter URL']
    },
    linkedin: {
      type: String,
      match: [/^https?:\/\/(www\.)?linkedin\.com\/.+/, 'Please provide a valid LinkedIn URL']
    },
    youtube: {
      type: String,
      match: [/^https?:\/\/(www\.)?youtube\.com\/.+/, 'Please provide a valid YouTube URL']
    }
  },
  members: {
    total: {
      type: Number,
      default: 0,
      min: [0, 'Total members cannot be negative']
    },
    active: {
      type: Number,
      default: 0,
      min: [0, 'Active members cannot be negative']
    },
    executives: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      position: {
        type: String,
        required: true,
        enum: [
          'President',
          'Vice President',
          'Secretary',
          'Treasurer',
          'Event Coordinator',
          'Public Relations',
          'Technical Lead',
          'Marketing Head',
          'Member'
        ]
      },
      joinedAt: {
        type: Date,
        default: Date.now
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }]
  },
  events: {
    total: {
      type: Number,
      default: 0
    },
    upcoming: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    }],
    past: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    }]
  },
  founded: {
    type: Date,
    required: [true, 'Please provide founding date'],
    validate: {
      validator: function(date) {
        return date <= new Date();
      },
      message: 'Founded date cannot be in the future'
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocument: {
    public_id: String,
    url: String
  },
  faculty: {
    advisor: {
      name: {
        type: String,
        required: [true, 'Please provide faculty advisor name']
      },
      email: {
        type: String,
        required: [true, 'Please provide faculty advisor email'],
        match: [
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          'Please provide a valid email address'
        ]
      },
      department: String,
      phone: String
    }
  },
  achievements: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    date: {
      type: Date,
      required: true
    },
    image: {
      public_id: String,
      url: String
    }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  analytics: {
    profileViews: {
      type: Number,
      default: 0
    },
    eventAttendance: {
      type: Number,
      default: 0
    },
    averageEventRating: {
      type: Number,
      min: 0,
      max: 5
    },
    joinRequests: {
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
organizationSchema.index({ name: 'text', description: 'text' });
organizationSchema.index({ type: 1, status: 1 });
organizationSchema.index({ category: 1, status: 1 });
organizationSchema.index({ tags: 1 });
organizationSchema.index({ 'members.executives.user': 1 });
organizationSchema.index({ createdAt: -1 });

// Virtual for years since founding
organizationSchema.virtual('age').get(function() {
  const now = new Date();
  const founded = new Date(this.founded);
  return now.getFullYear() - founded.getFullYear();
});

// Virtual for total events hosted
organizationSchema.virtual('totalEventsHosted').get(function() {
  return this.events.total;
});

// Pre-save middleware to calculate totals
organizationSchema.pre('save', function(next) {
  // Update active members count
  this.members.active = this.members.executives.filter(exec => exec.isActive).length;
  
  // Update total events count
  this.events.total = this.events.upcoming.length + this.events.past.length;
  
  next();
});

// Instance method to add member
organizationSchema.methods.addMember = function(userId, position = 'Member') {
  const existingMember = this.members.executives.find(
    exec => exec.user.toString() === userId.toString()
  );
  
  if (existingMember) {
    throw new Error('User is already a member of this organization');
  }
  
  this.members.executives.push({
    user: userId,
    position: position,
    isActive: true
  });
  
  this.members.total += 1;
  return this.save();
};

// Instance method to remove member
organizationSchema.methods.removeMember = function(userId) {
  const memberIndex = this.members.executives.findIndex(
    exec => exec.user.toString() === userId.toString()
  );
  
  if (memberIndex === -1) {
    throw new Error('User is not a member of this organization');
  }
  
  this.members.executives.splice(memberIndex, 1);
  this.members.total = Math.max(0, this.members.total - 1);
  return this.save();
};

// Instance method to update member position
organizationSchema.methods.updateMemberPosition = function(userId, newPosition) {
  const member = this.members.executives.find(
    exec => exec.user.toString() === userId.toString()
  );
  
  if (!member) {
    throw new Error('User is not a member of this organization');
  }
  
  member.position = newPosition;
  return this.save();
};

// Instance method to check if user is member
organizationSchema.methods.isMember = function(userId) {
  return this.members.executives.some(
    exec => exec.user.toString() === userId.toString() && exec.isActive
  );
};

// Instance method to get user position
organizationSchema.methods.getUserPosition = function(userId) {
  const member = this.members.executives.find(
    exec => exec.user.toString() === userId.toString() && exec.isActive
  );
  return member ? member.position : null;
};

export default mongoose.model('Organization', organizationSchema);