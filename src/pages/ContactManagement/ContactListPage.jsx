import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  contactGetMyContactsRequest,
} from '../../redux/actions/contactActions';
import {
  MessageSquare,
  Search,
  Calendar,
  Eye,
  Edit,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const ContactListPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const {
    contacts,
    contactsLoading,
  } = useSelector((state) => state.contact);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 5 contacts per page

  // Fetch all contacts (admin can see all)
  useEffect(() => {
    const params = {
      page: 1,
      limit: 100, // Get more contacts for admin
      ...(statusFilter !== 'all' && { status: statusFilter }),
      ...(categoryFilter !== 'all' && { category: categoryFilter }),
    };
    dispatch(contactGetMyContactsRequest(params));
  }, [dispatch, statusFilter, categoryFilter]);

  // Reset to page 1 when filters change
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
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter contacts (default sort: newest first by created_at)
  const filteredAndSortedContacts = () => {
    let filtered = Array.isArray(contacts) ? [...contacts] : [];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(contact =>
        contact.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Default sort: newest first (by created_at desc)
    filtered.sort((a, b) => {
      const aDate = new Date(a.created_at || a.createdAt || 0).getTime();
      const bDate = new Date(b.created_at || b.createdAt || 0).getTime();
      return bDate > aDate ? 1 : -1;
    });

    return filtered;
  };

  const allContacts = filteredAndSortedContacts();

  // Calculate pagination
  const totalPages = Math.ceil(allContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayContacts = allContacts.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetail = (contact) => {
    const contactId = contact._id || contact.id;
    navigate(`/admin/contacts/${contactId}`);
  };

  const handleEdit = (contact) => {
    const contactId = contact._id || contact.id;
    navigate(`/admin/contacts/${contactId}/edit`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-6 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
            Contact Management
          </h1>
          <p className="text-lg text-gray-600">
            List of contacts from customers
          </p>
        </div>

        {/* Filters and List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Filters */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by subject or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="all">All</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="all">All</option>
                  <option value="products">Products</option>
                  <option value="warranty">Warranty</option>
                  <option value="policies">Policies</option>
                  <option value="services">Services</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contacts List */}
          <div className="divide-y divide-gray-200">
            {contactsLoading ? (
              <div className="p-12 text-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Loading...</p>
              </div>
            ) : displayContacts.length === 0 ? (
              <div className="p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No contacts</p>
              </div>
            ) : (
              <>
                {displayContacts.map((contact) => (
                  <div
                    key={contact._id || contact.id}
                    className="p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2">
                          {contact.subject}
                        </h3>
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          {getStatusBadge(contact.status)}
                          {contact.category && (
                            <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                              {contact.category}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(contact.created_at || contact.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                          onClick={() => handleViewDetail(contact)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 font-semibold"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleEdit(contact)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 font-semibold"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Showing {startIndex + 1}-{Math.min(endIndex, allContacts.length)} of {allContacts.length} contacts
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Previous Button */}
                        <button
                          onClick={handlePreviousPage}
                          disabled={currentPage === 1}
                          className={`flex items-center gap-1 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                            currentPage === 1
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm'
                          }`}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Previous</span>
                        </button>

                        {/* Page Numbers */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                            // Show first page, last page, current page, and pages around current
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={page}
                                  onClick={() => handlePageClick(page)}
                                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                                    currentPage === page
                                      ? 'bg-blue-600 text-white shadow-md'
                                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm'
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            } else if (
                              page === currentPage - 2 ||
                              page === currentPage + 2
                            ) {
                              return (
                                <span key={page} className="px-2 text-gray-400">
                                  ...
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>

                        {/* Next Button */}
                        <button
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                          className={`flex items-center gap-1 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                            currentPage === totalPages
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm'
                          }`}
                        >
                          <span>Next</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactListPage;
