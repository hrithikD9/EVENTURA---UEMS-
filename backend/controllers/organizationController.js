const User = require('../models/userModel');

// @desc    Get all organizations
// @route   GET /api/organizations
// @access  Public
const getOrganizations = async (req, res) => {
  try {
    const organizations = await User.find({ 
      role: 'organizer',
      'organizationInfo.isOnboardingComplete': true 
    }).select('name organizationInfo');
    
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get organization by ID
// @route   GET /api/organizations/:id
// @access  Public
const getOrganizationById = async (req, res) => {
  try {
    const organization = await User.findOne({
      _id: req.params.id,
      role: 'organizer',
      'organizationInfo.isOnboardingComplete': true
    }).select('name organizationInfo');

    if (organization) {
      res.json(organization);
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
    const student = await User.findById(req.user._id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // In a real app, we would have a dedicated schema for following relationships
    // For simplicity, we'll just return success here
    res.json({ message: 'Successfully followed the organization' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getOrganizations, getOrganizationById, followOrganization };
