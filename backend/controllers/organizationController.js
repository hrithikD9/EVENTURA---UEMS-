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
      const adminUserId = req.query.adminUser;
      console.log(`Checking for organizations with adminUser: ${adminUserId}`);
      
      // First verify if there are any organizations for this admin at all
      const allAdminOrgs = await Organization.find({ 
        adminUser: adminUserId,
        status: 'active'
      });
      
      console.log(`Found ${allAdminOrgs.length} total organizations for adminUser ${adminUserId}`);
      
      if (allAdminOrgs.length === 0) {
        console.log('No organizations found for this admin user. Checking user existence...');
        
        // Check if user exists
        const user = await User.findById(adminUserId);
        if (!user) {
          console.log(`User with ID ${adminUserId} does not exist`);
        } else {
          console.log(`User exists: ${user.name} (${user.role}), but has no organizations`);
        }
      } else {
        console.log(`Organizations found for ${adminUserId}:`, 
          allAdminOrgs.map(o => ({ id: o._id, name: o.name })));
      }
      
      // Set the query filter
      query.adminUser = adminUserId;
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
    
    // Fetch organizations with pagination and populate adminUser
    const organizations = await Organization.find(query)
      .sort(sortCriteria)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .select('-members')
      .populate({
        path: 'adminUser',
        select: 'name email _id'
      });
    
    // Log organizations found
    console.log(`Found ${organizations.length} organizations matching query:`, 
                JSON.stringify(query, (key, value) => 
                  key === 'adminUser' && typeof value === 'object' ? value.toString() : value));
    
    // Return with pagination info
    res.json({
      organizations,
      pagination: {
        totalOrgs,
        totalPages: Math.ceil(totalOrgs / pageSize),
        currentPage: pageNumber,
        hasNextPage: pageNumber * pageSize < totalOrgs,
        hasPrevPage: pageNumber > 1,
        query: { ...query, adminUser: query.adminUser ? query.adminUser.toString() : null } // For debugging
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

// @desc    Debug endpoint to check organizations by admin ID
// @route   GET /api/organizations/debug/:adminId
// @access  Public
const debugOrganizationsByAdmin = async (req, res) => {
  try {
    const adminId = req.params.adminId;
    console.log(`Debug request for admin ID: ${adminId}`);
    
    // Check direct match without conversion
    const directMatch = await Organization.find({ adminUser: adminId })
                                          .select('name description adminUser')
                                          .populate({
                                            path: 'adminUser',
                                            select: 'name email _id'
                                          });
    
    // Try with ObjectId conversion
    let objectIdMatch = [];
    try {
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(adminId)) {
        const objId = mongoose.Types.ObjectId(adminId);
        objectIdMatch = await Organization.find({ adminUser: objId })
                                         .select('name description adminUser')
                                         .populate({
                                           path: 'adminUser',
                                           select: 'name email _id'
                                         });
      }
    } catch (err) {
      console.error('Error with ObjectId conversion:', err);
    }
    
    // Check if user exists
    let user = null;
    try {
      const User = require('../models/userModel');
      user = await User.findById(adminId).select('-password');
      
      if (!user) {
        // Try finding by string comparison if ObjectId fails
        user = await User.findOne({ _id: adminId }).select('-password');
      }
    } catch (err) {
      console.error('Error finding user:', err);
    }
    
    // Get organizations count by type for reference
    const orgCountByType = await Organization.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get all organizations (for comparison) - limited sample
    const allOrgs = await Organization.find()
                                     .select('name adminUser category')
                                     .limit(5)
                                     .populate({
                                       path: 'adminUser',
                                       select: 'name email _id'
                                     });
    
    res.json({
      adminId,
      user,
      directMatchCount: directMatch.length,
      directMatches: directMatch,
      objectIdMatchCount: objectIdMatch.length,
      objectIdMatches: objectIdMatch,
      allOrgsCount: await Organization.countDocuments(),
      allOrgsSample: allOrgs,
      categoryStats: orgCountByType,
      possibleIssue: !user ? "User not found" : 
                    directMatch.length === 0 && objectIdMatch.length === 0 ? 
                    "No organizations for this user" : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a debug organization (only for development)
// @route   POST /api/admin/organizations
// @access  Private/Admin
const createDebugOrganization = async (req, res) => {
  try {
    const { name, description, category, adminUser } = req.body;
    
    console.log('Debug org creation request received:', req.body);
    
    if (!name || !description || !category || !adminUser) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Try to create even if user doesn't exist (for debugging purposes)
    console.log(`Creating debug organization with adminUser: ${adminUser}`);
    
    // Create the organization
    const organization = new Organization({
      name,
      description,
      category,
      adminUser,
      ...req.body
    });
    
    const savedOrg = await organization.save();
    console.log('Debug organization created successfully:', savedOrg);
    
    res.status(201).json(savedOrg);
  } catch (error) {
    console.error('Error creating debug organization:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOrganizations,
  getOrganizationById,
  followOrganization,
  getFeaturedOrganizations,
  getOrganizationCategories,
  debugOrganizationsByAdmin,
  createDebugOrganization
};
