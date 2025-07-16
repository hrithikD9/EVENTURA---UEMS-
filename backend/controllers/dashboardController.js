const User = require('../models/userModel');
const Event = require('../models/eventModel');
const asyncHandler = require('express-async-handler');

/**
 * Get dashboard statistics
 * @route GET /api/dashboard/stats
 * @access Private/Organizer
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    // Get organization name from the authenticated user
    const organizerName = req.user.name;
    const organizationName = req.user.organizationInfo?.orgName;

    if (!organizerName) {
      return res.status(400).json({ success: false, message: 'User information not found' });
    }

    // Get active events count (events that haven't ended yet)
    const activeEvents = await Event.countDocuments({
      'organizer.name': organizerName,
      eventDate: { $gte: new Date() },
      status: 'active'
    });

    // Get total registration count for this organization's events
    const events = await Event.find({ 'organizer.name': organizerName });
    const eventIds = events.map(event => event._id);
    
    let totalRegistrations = 0;
    events.forEach(event => {
      totalRegistrations += event.registrants?.length || 0;
    });

    // Get total views for all events
    const totalViews = events.reduce((sum, event) => sum + (event.views || 0), 0);

    // Calculate attendance rate if events have attendees recorded
    let attendanceCount = 0;
    let registeredCount = 0;
    
    events.forEach(event => {
      if (event.completed) {
        registeredCount += event.registrants?.length || 0;
        attendanceCount += event.attendees?.length || 0;
      }
    });
    
    const attendanceRate = registeredCount > 0 
      ? Math.round((attendanceCount / registeredCount) * 100) 
      : 0;

    // Get trends (comparing current month with previous month)
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // Count registrations this month
    const currentMonthRegistrations = await getRegistrationsInPeriod(
      eventIds, 
      currentMonthStart, 
      now
    );
    
    // Count registrations last month
    const previousMonthRegistrations = await getRegistrationsInPeriod(
      eventIds, 
      previousMonthStart, 
      currentMonthStart
    );
    
    // Calculate percentage change
    const registrationChange = previousMonthRegistrations > 0 
      ? Math.round(((currentMonthRegistrations - previousMonthRegistrations) / previousMonthRegistrations) * 100) 
      : 100;

    // Get events this month vs last month for trend
    const currentMonthEvents = await Event.countDocuments({
      'organizer.name': organizerName,
      createdAt: { $gte: currentMonthStart, $lte: now }
    });
    
    const previousMonthEvents = await Event.countDocuments({
      'organizer.name': organizerName,
      createdAt: { $gte: previousMonthStart, $lt: currentMonthStart }
    });
    
    const eventChange = previousMonthEvents > 0 
      ? Math.round(((currentMonthEvents - previousMonthEvents) / previousMonthEvents) * 100) 
      : 100;

    // Get views this month vs last month
    const currentMonthViews = events
      .filter(event => event.lastViewed >= currentMonthStart)
      .reduce((sum, event) => sum + (event.views || 0), 0);
      
    const previousMonthViews = events
      .filter(event => event.lastViewed >= previousMonthStart && event.lastViewed < currentMonthStart)
      .reduce((sum, event) => sum + (event.views || 0), 0);
      
    const viewsChange = previousMonthViews > 0 
      ? Math.round(((currentMonthViews - previousMonthViews) / previousMonthViews) * 100) 
      : 100;

    // Calculate attendance rate change
    // This would require historical attendance data which might not be available
    // For now, using a random small number for demonstration
    const attendanceChange = -3;

    res.json({
      success: true,
      data: {
        activeEvents,
        totalRegistrations,
        totalViews,
        attendanceRate,
        trends: {
          events: {
            change: eventChange,
            direction: eventChange >= 0 ? 'up' : 'down'
          },
          registrations: {
            change: registrationChange,
            direction: registrationChange >= 0 ? 'up' : 'down'
          },
          views: {
            change: viewsChange,
            direction: viewsChange >= 0 ? 'up' : 'down'
          },
          attendance: {
            change: attendanceChange,
            direction: attendanceChange >= 0 ? 'up' : 'down'
          }
        }
      }
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Failed to get dashboard stats' });
  }
});

/**
 * Helper function to get registrations in a period
 */
async function getRegistrationsInPeriod(eventIds, startDate, endDate) {
  const events = await Event.find({
    _id: { $in: eventIds },
    'registrants.registrationDate': { $gte: startDate, $lt: endDate }
  });
  
  let count = 0;
  events.forEach(event => {
    event.registrants.forEach(reg => {
      if (reg.registrationDate >= startDate && reg.registrationDate < endDate) {
        count++;
      }
    });
  });
  
  return count;
}

/**
 * Get recent events
 * @route GET /api/dashboard/events
 * @access Private/Organizer
 */
const getRecentEvents = asyncHandler(async (req, res) => {
  try {
    const organizerName = req.user.name;
    
    if (!organizerName) {
      return res.status(400).json({ success: false, message: 'User information not found' });
    }
    
    // Get recent events sorted by created date
    const events = await Event.find({ 'organizer.name': organizerName })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title eventDate registrants status');
      
    // Format events for the frontend
    const formattedEvents = events.map(event => {
      return {
        id: event._id,
        title: event.title,
        date: event.eventDate,
        registrations: event.registrants?.length || 0,
        status: event.status
      };
    });
    
    res.json({
      success: true,
      data: formattedEvents
    });
  } catch (error) {
    console.error('Error getting recent events:', error);
    res.status(500).json({ success: false, message: 'Failed to get recent events' });
  }
});

/**
 * Get registration trends data
 * @route GET /api/dashboard/trends
 * @access Private/Organizer
 */
const getRegistrationTrends = asyncHandler(async (req, res) => {
  try {
    const organizerName = req.user.name;
    const { period = '30days' } = req.query;
    
    if (!organizerName) {
      return res.status(400).json({ success: false, message: 'User information not found' });
    }
    
    // Get events for this organization
    const events = await Event.find({ 'organizer.name': organizerName });
    const eventIds = events.map(event => event._id);
    
    // Calculate date ranges based on the period
    const now = new Date();
    let startDate;
    let format;
    
    switch(period) {
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        format = 'month'; // Group by month
        break;
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        format = 'month'; // Group by month
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        format = 'month'; // Group by month
        break;
      case '30days':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        format = 'day'; // Group by day
        break;
    }
    
    // Get all events with registrants
    const eventsWithRegistrants = await Event.find({
      _id: { $in: eventIds },
      'registrants.0': { $exists: true } // Events that have at least one registrant
    });
    
    // Create data points for the chart
    const trendsData = [];
    
    // If grouping by day
    if (format === 'day') {
      for (let i = 0; i < 30; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() - 29 + i);
        const day = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Count registrations for this day
        let count = 0;
        eventsWithRegistrants.forEach(event => {
          event.registrants.forEach(reg => {
            const regDate = new Date(reg.registrationDate);
            if (regDate.toISOString().split('T')[0] === day) {
              count++;
            }
          });
        });
        
        trendsData.push({
          date: day,
          count: count
        });
      }
    } 
    // If grouping by month
    else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      let numMonths = 12;
      if (period === '3months') numMonths = 3;
      if (period === '6months') numMonths = 6;
      
      for (let i = 0; i < numMonths; i++) {
        const monthIndex = (now.getMonth() - numMonths + 1 + i + 12) % 12;
        const year = now.getFullYear() - (monthIndex > now.getMonth() ? 1 : 0);
        
        const monthStart = new Date(year, monthIndex, 1);
        const monthEnd = new Date(year, monthIndex + 1, 0);
        
        // Count registrations for this month
        let count = 0;
        eventsWithRegistrants.forEach(event => {
          event.registrants.forEach(reg => {
            const regDate = new Date(reg.registrationDate);
            if (regDate >= monthStart && regDate <= monthEnd) {
              count++;
            }
          });
        });
        
        trendsData.push({
          date: `${months[monthIndex]} ${year}`,
          count: count
        });
      }
    }
    
    res.json({
      success: true,
      data: trendsData
    });
  } catch (error) {
    console.error('Error getting registration trends:', error);
    res.status(500).json({ success: false, message: 'Failed to get registration trends' });
  }
});

/**
 * Get recent registrants
 * @route GET /api/dashboard/registrants
 * @access Private/Organizer
 */
const getRecentRegistrants = asyncHandler(async (req, res) => {
  try {
    const organizerName = req.user.name;
    
    if (!organizerName) {
      return res.status(400).json({ success: false, message: 'User information not found' });
    }
    
    // Get all events for this organization
    const events = await Event.find({ 'organizer.name': organizerName })
      .select('title registrants');
    
    // Extract all registrants with event details
    let allRegistrants = [];
    events.forEach(event => {
      if (event.registrants && event.registrants.length > 0) {
        event.registrants.forEach(registrant => {
          allRegistrants.push({
            userId: registrant.userId,
            name: registrant.name,
            email: registrant.email,
            eventId: event._id,
            eventTitle: event.title,
            registrationDate: registrant.registrationDate,
            status: registrant.status || 'Confirmed'
          });
        });
      }
    });
    
    // Sort by registration date (newest first) and limit to 10
    allRegistrants.sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));
    allRegistrants = allRegistrants.slice(0, 10);
    
    // Format dates for display
    allRegistrants = allRegistrants.map(reg => {
      const regDate = new Date(reg.registrationDate);
      const formattedDate = `${regDate.toLocaleString('default', { month: 'short' })} ${regDate.getDate()}, ${regDate.getFullYear()}`;
      
      return {
        ...reg,
        formattedDate
      };
    });
    
    res.json({
      success: true,
      data: allRegistrants
    });
  } catch (error) {
    console.error('Error getting recent registrants:', error);
    res.status(500).json({ success: false, message: 'Failed to get recent registrants' });
  }
});

module.exports = {
  getDashboardStats,
  getRecentEvents,
  getRegistrationTrends,
  getRecentRegistrants
};
