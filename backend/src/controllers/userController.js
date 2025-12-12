import User from '../models/User.js';
import Event from '../models/Event.js';

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({ isActive: true })
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
export const getUser = async (req, res, next) => {
  try {
    // If no ID provided, return current user
    const userId = req.params.id || req.user.id;
    
    const user = await User.findById(userId)
      .select('-password')
      .populate('registeredEvents.event', 'title date location category');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      bio: req.body.bio
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete - set isActive to false
    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
};

// @desc    Get user events
// @route   GET /api/users/events
// @access  Private
export const getUserEvents = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'registeredEvents.event',
        select: 'title description date time location category status maxAttendees currentAttendees images'
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Filter out null events (in case event was deleted)
    const validEvents = user.registeredEvents.filter(reg => reg.event);

    // Categorize events
    const now = new Date();
    const events = {
      upcoming: validEvents.filter(reg => new Date(reg.event.date) > now),
      past: validEvents.filter(reg => new Date(reg.event.date) <= now),
      all: validEvents
    };

    res.status(200).json({
      success: true,
      count: {
        total: events.all.length,
        upcoming: events.upcoming.length,
        past: events.past.length
      },
      data: events
    });
  } catch (error) {
    console.error('Get user events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user events'
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
export const getUserStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('registeredEvents.event', 'date category');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const now = new Date();
    const validEvents = user.registeredEvents.filter(reg => reg.event);

    // Calculate statistics
    const stats = {
      totalEvents: validEvents.length,
      upcomingEvents: validEvents.filter(reg => new Date(reg.event.date) > now).length,
      pastEvents: validEvents.filter(reg => new Date(reg.event.date) <= now).length,
      attendedEvents: validEvents.filter(reg => reg.attended).length,
      certificates: validEvents.filter(reg => reg.attended).length, // Assuming all attended events give certificates
      eventsThisMonth: validEvents.filter(reg => {
        const eventDate = new Date(reg.event.date);
        return eventDate.getMonth() === now.getMonth() && 
               eventDate.getFullYear() === now.getFullYear();
      }).length,
      favoriteCategories: {}
    };

    // Calculate favorite categories
    validEvents.forEach(reg => {
      const category = reg.event.category;
      stats.favoriteCategories[category] = (stats.favoriteCategories[category] || 0) + 1;
    });

    // Convert to array and sort
    const categoriesArray = Object.entries(stats.favoriteCategories)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 categories

    stats.favoriteCategories = categoriesArray;

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics'
    });
  }
};