const mongoose = require('mongoose');

const organizationSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['Academic', 'Technology', 'Arts', 'Sports', 'Cultural', 'Science', 'Other'],
      required: true,
    },
    type: {
      type: String,
      enum: ['Club', 'Society', 'Department', 'Team', 'Association', 'Other'],
      default: 'Club',
    },
    foundedYear: {
      type: Number,
    },
    location: {
      type: String,
      default: 'On Campus',
    },
    website: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
    },
    adminUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['admin', 'moderator', 'member'],
          default: 'member',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    followers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        followedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    stats: {
      totalEvents: {
        type: Number,
        default: 0,
      },
      totalMembers: {
        type: Number,
        default: 0,
      },
      totalFollowers: {
        type: Number,
        default: 0,
      },
      rating: {
        type: Number,
        default: 0,
      },
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    featuredUntil: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'rejected'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to update stats
organizationSchema.pre('save', function (next) {
  if (this.members) {
    this.stats.totalMembers = this.members.length;
  }
  if (this.followers) {
    this.stats.totalFollowers = this.followers.length;
  }
  next();
});

// Add indexes for better query performance
organizationSchema.index({ name: 'text', description: 'text' });
organizationSchema.index({ category: 1 });
organizationSchema.index({ status: 1 });
organizationSchema.index({ isFeatured: 1 });

const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization;
