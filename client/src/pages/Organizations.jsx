import { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { organizationService } from '@/services/organizationService';
import OrganizationCard from '@/components/organizations/OrganizationCard';
import Loader from '@/components/common/Loader';
import toast from 'react-hot-toast';

const Organizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const organizationTypes = [
    'all',
    'Technical Society',
    'Sports Club',
    'Cultural Society',
    'Academic Club',
  ];

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    filterOrganizations();
  }, [searchTerm, selectedType, organizations]);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const data = await organizationService.getAllOrganizations();
      setOrganizations(data);
      setFilteredOrganizations(data);
    } catch (error) {
      toast.error('Failed to load organizations');
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrganizations = () => {
    let filtered = [...organizations];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (org) =>
          org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          org.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter((org) => org.type === selectedType);
    }

    setFilteredOrganizations(filtered);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container px-4 mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-3 text-4xl font-bold text-gray-900 font-display">
            Student Organizations
          </h1>
          <p className="text-lg text-gray-600">
            Discover and join clubs and societies that match your interests
          </p>
        </div>

        {/* Filters */}
        <div className="p-6 mb-8 bg-white shadow-sm rounded-xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Filter className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="pl-10 input"
              >
                {organizationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || selectedType !== 'all') && (
            <div className="flex items-center gap-2 pt-4 mt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">Active filters:</span>
              {searchTerm && (
                <span className="badge badge-primary">
                  Search: "{searchTerm}"
                </span>
              )}
              {selectedType !== 'all' && (
                <span className="badge badge-secondary">{selectedType}</span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                }}
                className="ml-auto text-sm text-teal-600 hover:text-teal-700"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredOrganizations.length}</span> organization
            {filteredOrganizations.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Organizations Grid */}
        {filteredOrganizations.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            {filteredOrganizations.map((organization) => (
              <OrganizationCard key={organization.id} organization={organization} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gray-100 rounded-full">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              No organizations found
            </h3>
            <p className="mb-4 text-gray-600">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
              }}
              className="font-medium text-teal-600 hover:text-teal-700"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Organizations;
