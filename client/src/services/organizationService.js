// Mock organization service with sample data

const MOCK_ORGANIZATIONS = [
  {
    id: '1',
    name: 'NEUB CSE Society',
    slug: 'neub-cse-society',
    description: 'The Computer Science and Engineering Society brings together tech enthusiasts, fostering innovation and excellence in the field of computer science.',
    type: 'Technical Society',
    logo: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200',
    members: 250,
    eventsHosted: 15,
    founded: '2018',
    email: 'cse.society@neub.edu.bd',
    phone: '+880 1234-567890',
    socialMedia: {
      facebook: 'https://facebook.com/neubcse',
      twitter: 'https://twitter.com/neubcse',
      instagram: 'https://instagram.com/neubcse',
    },
    upcomingEvents: ['1'],
  },
  {
    id: '2',
    name: 'Sports Club',
    slug: 'sports-club',
    description: 'Promoting physical fitness and sportsmanship through various indoor and outdoor sporting activities and competitions.',
    type: 'Sports Club',
    logo: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400',
    coverImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200',
    members: 180,
    eventsHosted: 12,
    founded: '2017',
    email: 'sports@neub.edu.bd',
    phone: '+880 1234-567891',
    socialMedia: {
      facebook: 'https://facebook.com/neubsports',
      instagram: 'https://instagram.com/neubsports',
    },
    upcomingEvents: ['2'],
  },
  {
    id: '3',
    name: 'Photography Club',
    slug: 'photography-club',
    description: 'Capturing moments and telling stories through the lens. We organize workshops, photo walks, and exhibitions.',
    type: 'Cultural Society',
    logo: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400',
    coverImage: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1200',
    members: 120,
    eventsHosted: 8,
    founded: '2019',
    email: 'photography@neub.edu.bd',
    phone: '+880 1234-567892',
    socialMedia: {
      facebook: 'https://facebook.com/neubphoto',
      instagram: 'https://instagram.com/neubphoto',
    },
    upcomingEvents: ['4'],
  },
  {
    id: '4',
    name: 'Robotics Club',
    slug: 'robotics-club',
    description: 'Exploring the fascinating world of robotics, automation, and artificial intelligence through hands-on projects and competitions.',
    type: 'Technical Society',
    logo: 'https://images.unsplash.com/photo-1563207153-f403bf289096?w=400',
    coverImage: 'https://images.unsplash.com/photo-1563207153-f403bf289096?w=1200',
    members: 95,
    eventsHosted: 6,
    founded: '2020',
    email: 'robotics@neub.edu.bd',
    phone: '+880 1234-567893',
    socialMedia: {
      facebook: 'https://facebook.com/neubrobotics',
      twitter: 'https://twitter.com/neubrobotics',
    },
    upcomingEvents: ['5'],
  },
  {
    id: '5',
    name: 'Debate Society',
    slug: 'debate-society',
    description: 'Sharpening critical thinking and public speaking skills through engaging debates on contemporary issues.',
    type: 'Academic Club',
    logo: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400',
    coverImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200',
    members: 85,
    eventsHosted: 10,
    founded: '2018',
    email: 'debate@neub.edu.bd',
    phone: '+880 1234-567894',
    socialMedia: {
      facebook: 'https://facebook.com/neubdebate',
    },
    upcomingEvents: [],
  },
];

const delay = (ms = 600) => new Promise(resolve => setTimeout(resolve, ms));

export const organizationService = {
  async getAllOrganizations(filters = {}) {
    await delay();
    
    let filtered = [...MOCK_ORGANIZATIONS];
    
    if (filters.type) {
      filtered = filtered.filter(o => o.type === filters.type);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(o =>
        o.name.toLowerCase().includes(searchLower) ||
        o.description.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  },

  async getOrganizationById(id) {
    await delay();
    
    const org = MOCK_ORGANIZATIONS.find(o => o.id === id);
    if (!org) {
      throw new Error('Organization not found');
    }
    
    return org;
  },

  async getOrganizationBySlug(slug) {
    await delay();
    
    const org = MOCK_ORGANIZATIONS.find(o => o.slug === slug);
    if (!org) {
      throw new Error('Organization not found');
    }
    
    return org;
  },

  async createOrganization(orgData) {
    await delay();
    
    const newOrg = {
      id: Date.now().toString(),
      ...orgData,
      members: 0,
      eventsHosted: 0,
      founded: new Date().getFullYear().toString(),
      upcomingEvents: [],
    };
    
    MOCK_ORGANIZATIONS.push(newOrg);
    return newOrg;
  },

  async updateOrganization(id, orgData) {
    await delay();
    
    const index = MOCK_ORGANIZATIONS.findIndex(o => o.id === id);
    if (index === -1) {
      throw new Error('Organization not found');
    }
    
    MOCK_ORGANIZATIONS[index] = { ...MOCK_ORGANIZATIONS[index], ...orgData };
    return MOCK_ORGANIZATIONS[index];
  },

  async getTopOrganizations() {
    await delay();
    
    return [...MOCK_ORGANIZATIONS]
      .sort((a, b) => b.members - a.members)
      .slice(0, 4);
  },

  async joinOrganization(orgId, userId) {
    await delay();
    
    const org = MOCK_ORGANIZATIONS.find(o => o.id === orgId);
    if (!org) {
      throw new Error('Organization not found');
    }
    
    org.members += 1;
    return { message: 'Successfully joined organization', organization: org };
  },

  async leaveOrganization(orgId, userId) {
    await delay();
    
    const org = MOCK_ORGANIZATIONS.find(o => o.id === orgId);
    if (!org) {
      throw new Error('Organization not found');
    }
    
    org.members = Math.max(0, org.members - 1);
    return { message: 'Successfully left organization', organization: org };
  },
};
