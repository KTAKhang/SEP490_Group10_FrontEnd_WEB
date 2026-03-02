import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  contactGetMyContactsRequest,
} from '../../redux/actions/contactActions';
import {
  MessageSquare,
  Search,
  Filter,
  Calendar,
  Eye,
  Edit,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const ContactListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Detect base path from current location
  const getBasePath = () => {
    if (location.pathname.startsWith('/feedbacked-staff')) {
      return '/feedbacked-staff';
    }
    return '/admin';
  };
  const basePath = getBasePath();

  const {
    contacts,
    contactsLoading,
  } = useSelector((state) => state.contact);

  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const params = {
      page: 1,
      limit: 100,
      ...(statusFilter !== 'all' && { status: statusFilter }),
      ...(categoryFilter !== 'all' && { category: categoryFilter }),
    };
    dispatch(contactGetMyContactsRequest(params));
  }, [dispatch, statusFilter, categoryFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, categoryFilter, searchTerm]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      OPEN: { label: 'Open', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
      IN_PROGRESS: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      RESOLVED: { label: 'Resolved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      CLOSED: { label: 'Closed', color: 'bg-gray-100 text-gray-800', icon: XCircle },
    };
    const config = statusConfig[status] || statusConfig.OPEN;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredAndSortedContacts = () => {
    let filtered = Array.isArray(contacts) ? [...contacts] : [];
    if (searchTerm) {
      filtered = filtered.filter(contact =>
        contact.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    filtered.sort((a, b) => {
      const aDate = new Date(a.created_at || a.createdAt || 0).getTime();
      const bDate = new Date(b.created_at || b.createdAt || 0).getTime();
      return bDate > aDate ? 1 : -1;
    });
    return filtered;
  };

  const allContacts = filteredAndSortedContacts();
  const totalPages = Math.ceil(allContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayContacts = allContacts.slice(startIndex, endIndex);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleViewDetail = (contact) => {
    const contactId = contact._id || contact.id;
    navigate(`${basePath}/contacts/${contactId}`);
  };

  const handleEdit = (contact) => {
    const contactId = contact._id || contact.id;
    navigate(`${basePath}/contacts/${contactId}/edit`);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Contact Management</h1>
        </div>

        {/* Filters - giống News */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by subject or content..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 cursor-default"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 cursor-default"
              >
                <option value="all">All Status</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 cursor-default"
              >
                <option value="all">All Category</option>
                <option value="products">Products</option>
                <option value="warranty">Warranty</option>
                <option value="policies">Policies</option>
                <option value="services">Services</option>
                <option value="other">Other</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Table - giống News */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {contactsLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : displayContacts.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayContacts.map((contact) => (
                    <tr key={contact._id || contact.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 line-clamp-2">
                            {contact.subject}
                          </div>
                          {contact.message && (
                            <div className="text-sm text-gray-500 line-clamp-1 mt-1">
                              {contact.message.substring(0, 60)}
                              {contact.message.length > 60 ? '...' : ''}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {contact.category || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(contact.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(contact.created_at || contact.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewDetail(contact)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(contact)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination - giống News */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, allContacts.length)} of{' '}
                  {allContacts.length} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">No contacts found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactListPage;
