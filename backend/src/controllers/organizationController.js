import Organization from '../models/Organization.js';
import Event from '../models/Event.js';

// @desc    Get all organizations
// @route   GET /api/organizations
// @access  Public
export const getOrganizations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build query
    let query = { status: 'active' };

    // Filter by type
    if (req.query.type) {
      query.type = req.query.type;
    }

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Search by name or description
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    const organizations = await Organization.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Organization.countDocuments(query);

    res.status(200).json({
      success: true,
      count: organizations.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: organizations
    });
  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching organizations'
    });
  }
};

// @desc    Get single organization
// @route   GET /api/organizations/:id
// @access  Public
export const getOrganization = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Increment profile views
    organization.analytics.profileViews += 1;
    await organization.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching organization'
    });
  }
};

// @desc    Create organization
// @route   POST /api/organizations
// @access  Private (Organizer/Admin)
export const createOrganization = async (req, res, next) => {
  try {
    // Add creator as the first executive (President)
    req.body.members = {
      executives: [{
        user: req.user._id,
        position: 'President',
        isActive: true
      }],
      total: 1
    };

    const organization = await Organization.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      data: organization
    });
  } catch (error) {
    console.error('Create organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating organization'
    });
  }
};

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Private (Organization Admin/Admin)
export const updateOrganization = async (req, res, next) => {
  try {
    const organization = await Organization.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Organization updated successfully',
      data: organization
    });
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating organization'
    });
  }
};

// @desc    Delete organization
// @route   DELETE /api/organizations/:id
// @access  Private (Organization Admin/Admin)
export const deleteOrganization = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if organization has active events
    const activeEvents = await Event.countDocuments({
      'organizer.organization': organization.name,
      date: { $gte: new Date() }
    });

    if (activeEvents > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete organization with active events'
      });
    }

    await Organization.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Organization deleted successfully'
    });
  } catch (error) {
    console.error('Delete organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting organization'
    });
  }
};

// @desc    Join organization
// @route   POST /api/organizations/:id/join
// @access  Private
export const joinOrganization = async (req, res, next) => {
  try {
    const { position = 'Member' } = req.body;

    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user is already a member
    if (organization.isMember(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this organization'
      });
    }

    // Add member
    await organization.addMember(req.user.id, position);

    res.status(200).json({
      success: true,
      message: 'Successfully joined the organization'
    });
  } catch (error) {
    console.error('Join organization error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error joining organization'
    });
  }
};

// @desc    Leave organization
// @route   DELETE /api/organizations/:id/leave
// @access  Private
export const leaveOrganization = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if user is a member
    if (!organization.isMember(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this organization'
      });
    }

    // Check if user is the only president
    const userPosition = organization.getUserPosition(req.user.id);
    const presidents = organization.members.executives.filter(
      exec => exec.position === 'President' && exec.isActive
    );

    if (userPosition === 'President' && presidents.length === 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot leave organization as the only president. Please assign another president first.'
      });
    }

    // Remove member
    await organization.removeMember(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Successfully left the organization'
    });
  } catch (error) {
    console.error('Leave organization error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error leaving organization'
    });
  }
};

// @desc    Get organization members
// @route   GET /api/organizations/:id/members
// @access  Private (Organization Admin/Admin)
export const getOrganizationMembers = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id)
      .select('members name');

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    res.status(200).json({
      success: true,
      count: organization.members.active,
      data: organization.members.executives
    });
  } catch (error) {
    console.error('Get organization members error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching organization members'
    });
  }
};

// @desc    Update member role
// @route   PUT /api/organizations/:id/members/:userId
// @access  Private (Organization Admin/Admin)
export const updateMemberRole = async (req, res, next) => {
  try {
    const { position } = req.body;
    const { userId } = req.params;

    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if target user is a member
    if (!organization.isMember(userId)) {
      return res.status(404).json({
        success: false,
        message: 'User is not a member of this organization'
      });
    }

    // Update member position
    await organization.updateMemberPosition(userId, position);

    res.status(200).json({
      success: true,
      message: 'Member role updated successfully'
    });
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating member role'
    });
  }
};

// @desc    Get organization events
// @route   GET /api/organizations/:id/events
// @access  Public
export const getOrganizationEvents = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Get events by organization name
    const events = await Event.find({
      'organizer.organization': organization.name,
      status: 'published',
      isPublic: true
    })
      .select('-registeredUsers')
      .skip(skip)
      .limit(limit)
      .sort({ date: -1 });

    const total = await Event.countDocuments({
      'organizer.organization': organization.name,
      status: 'published',
      isPublic: true
    });

    // Categorize events
    const now = new Date();
    const upcomingEvents = events.filter(event => new Date(event.date) > now);
    const pastEvents = events.filter(event => new Date(event.date) <= now);

    res.status(200).json({
      success: true,
      count: events.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: {
        all: events,
        upcoming: upcomingEvents,
        past: pastEvents,
        stats: {
          total: events.length,
          upcoming: upcomingEvents.length,
          past: pastEvents.length
        }
      }
    });
  } catch (error) {
    console.error('Get organization events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching organization events'
    });
  }
};

// @desc    Get organizations by type
// @route   GET /api/organizations/type/:type
// @access  Public
export const getOrganizationsByType = async (req, res, next) => {
  try {
    const { type } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const organizations = await Organization.find({
      type,
      status: 'active'
    })
      .skip(skip)
      .limit(limit)
      .sort({ 'members.total': -1 });

    const total = await Organization.countDocuments({
      type,
      status: 'active'
    });

    res.status(200).json({
      success: true,
      count: organizations.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: organizations
    });
  } catch (error) {
    console.error('Get organizations by type error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching organizations by type'
    });
  }
};