const User = require('../models/userModel');
const Organization = require('../models/organizationModel');
const Event = require('../models/eventModel');

// @desc    Get all organizations
// @route   GET /api/organizations
// @access  Public
const getOrganizations = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 6, 
      category,
      search,
      sort = 'name'
    } = req.query;
    
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    
    // Build query
    const query = { status: 'active' };
    
    // Add category filter if specified
    if (category && category !== 'All') {
      query.category = category;
    }
    
    // Add search filter if specified
    if (search) {
      query.$text = { $search: search };
    }
    
    // Filter by admin user if specified
    if (req.query.adminUser) {
      query.adminUser = req.query.adminUser;
      console.log(`Filtering organizations for adminUser: ${req.query.adminUser}`);
    }
    
    // Count total documents
    const totalOrgs = await Organization.countDocuments(query);
    
    // Determine sort criteria
    let sortCriteria = {};
    switch(sort) {
      case 'newest':
        sortCriteria = { createdAt: -1 };
        break;
      case 'oldest':
        sortCriteria = { createdAt: 1 };
        break;
      case 'popular':
        sortCriteria = { 'stats.totalFollowers': -1 };
        break;
      case 'active':
        sortCriteria = { 'stats.totalEvents': -1 };
        break;
      default:
        sortCriteria = { name: 1 }; // alphabetical by default
    }
    
    // Fetch organizations with pagination
    const organizations = await Organization.find(query)
      .sort(sortCriteria)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .select('-members');
    
    // Return with pagination info
    res.json({
      organizations,
      pagination: {
        totalOrgs,
        totalPages: Math.ceil(totalOrgs / pageSize),
        currentPage: pageNumber,
        hasNextPage: pageNumber * pageSize < totalOrgs,
        hasPrevPage: pageNumber > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get organization by ID
// @route   GET /api/organizations/:id
// @access  Public
const getOrganizationById = async (req, res) => {
  try {
    const organization = await Organization.findOne({
      _id: req.params.id,
      status: 'active'
    }).populate({
      path: 'adminUser',
      select: 'name email'
    });

    if (organization) {
      // Get recent events by this organization
      const events = await Event.find({
        organizer: organization._id,
        eventDate: { $gte: new Date() }
      }).sort({ eventDate: 1 }).limit(3);
      
      // Send response with organization and its events
      res.json({ 
        organization, 
        events 
      });
    } else {
      res.status(404).json({ message: 'Organization not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Follow an organization
// @route   PUT /api/organizations/:id/follow
// @access  Private/Student
const followOrganization = async (req, res) => {
  try {
    const userId = req.user._id;
    const orgId = req.params.id;
    
    const organization = await Organization.findById(orgId);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    
    // Check if user already follows
    const alreadyFollows = organization.followers.some(
      follower => follower.userId.toString() === userId.toString()
    );
    
    let message = '';
    
    if (alreadyFollows) {
      // Unfollow
      organization.followers = organization.followers.filter(
        follower => follower.userId.toString() !== userId.toString()
      );
      message = 'Successfully unfollowed organization';
    } else {
      // Follow
      organization.followers.push({
        userId: userId,
        followedAt: new Date()
      });
      message = 'Successfully followed organization';
    }
    
    // Update stats
    organization.stats.totalFollowers = organization.followers.length;
    
    await organization.save();
    
    res.json({ 
      success: true, 
      message,
      isFollowing: !alreadyFollows,
      followerCount: organization.followers.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get featured organizations
// @route   GET /api/organizations/featured
// @access  Public
const getFeaturedOrganizations = async (req, res) => {
  try {
    const featuredOrgs = await Organization.find({
      isFeatured: true,
      status: 'active'
    }).limit(1);
    
    res.json(featuredOrgs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get organization categories with counts
// @route   GET /api/organizations/categories
// @access  Public
const getOrganizationCategories = async (req, res) => {
  try {
    const categories = await Organization.aggregate([
      { $match: { status: 'active' } },
      { $group: { 
        _id: '$category', 
        count: { $sum: 1 } 
      }},
      { $sort: { count: -1 } }
    ]);
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOrganizations,
  getOrganizationById,
  followOrganization,
  getFeaturedOrganizations,
  getOrganizationCategories
};
