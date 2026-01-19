import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  contactGetContactDetailRequest,
  contactDownloadAttachmentRequest,
  contactUpdateReplyRequest,
  contactDeleteReplyRequest,
  contactClearMessages,
} from '../../redux/actions/contactActions';
import {
  ArrowLeft,
  Edit,
  Calendar,
  Clock,
  UserCircle,
  Mail,
  FileText,
  Download,
  Eye,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Trash2,
  X,
  Check,
} from 'lucide-react';

const ContactDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Local state for editing replies
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editingReplyMessage, setEditingReplyMessage] = useState('');

  // Redux state
  const {
    contactDetail,
    replies,
    repliesLoading,
    updateReplySuccess,
    deleteReplySuccess,
  } = useSelector((state) => state.contact);

  // Fetch contact detail
  useEffect(() => {
    if (id) {
      dispatch(contactGetContactDetailRequest(id));
    }
  }, [id, dispatch]);

  // Refresh replies after successful update/delete
  useEffect(() => {
    if ((updateReplySuccess || deleteReplySuccess) && id) {
      dispatch(contactGetContactDetailRequest(id));
      dispatch(contactClearMessages());
      setEditingReplyId(null);
      setEditingReplyMessage('');
    }
  }, [updateReplySuccess, deleteReplySuccess, id, dispatch]);

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

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const time = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    return `${day} at ${time}`;
  };

  // Check if file is an image
  const isImageFile = (fileName) => {
    if (!fileName) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const lowerFileName = fileName.toLowerCase();
    return imageExtensions.some(ext => lowerFileName.endsWith(ext));
  };

  const handleViewAttachment = (fileUrl, fileName) => {
    // For images, open in new tab to view
    if (isImageFile(fileName)) {
      window.open(fileUrl, '_blank');
    } else {
      // For documents, download
      dispatch(contactDownloadAttachmentRequest(fileUrl, fileName));
    }
  };

  const handleDownloadAttachment = (fileUrl, fileName) => {
    // Always download (for both images and documents)
    dispatch(contactDownloadAttachmentRequest(fileUrl, fileName));
  };

  const handleStartEditReply = (reply) => {
    setEditingReplyId(reply._id || reply.id);
    setEditingReplyMessage(reply.message || '');
  };

  const handleCancelEditReply = () => {
    setEditingReplyId(null);
    setEditingReplyMessage('');
  };

  const handleSaveEditReply = () => {
    if (!id || !editingReplyId) return;

    if (!editingReplyMessage.trim()) {
      toast.error('Please enter reply content');
      return;
    }

    dispatch(contactUpdateReplyRequest(id, editingReplyId, editingReplyMessage.trim()));
    setEditingReplyId(null);
    setEditingReplyMessage('');
  };

  const handleDeleteReply = (replyId) => {
    if (!id || !replyId) return;
    
    if (window.confirm('Are you sure you want to delete this reply?')) {
      dispatch(contactDeleteReplyRequest(id, replyId));
    }
  };

  if (!contactDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-6 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Loading contact details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Get user information
  // Backend populates user_id with user_name and email fields
  let userInfo = {};
  let userName = 'N/A';
  let userEmail = 'N/A';

  // Backend populates user_id (not user), with fields: user_name, email
  if (contactDetail.user_id && typeof contactDetail.user_id === 'object' && !Array.isArray(contactDetail.user_id) && contactDetail.user_id !== null) {
    // user_id is populated object from backend
    userInfo = contactDetail.user_id;
    // Backend returns user_name (not name, full_name, username)
    userName = userInfo.user_name || userInfo.name || userInfo.full_name || userInfo.fullName || userInfo.username || 'N/A';
    userEmail = userInfo.email || 'N/A';
  } else if (contactDetail.user && typeof contactDetail.user === 'object' && !Array.isArray(contactDetail.user)) {
    // Fallback: if user object exists (shouldn't happen based on backend code)
    userInfo = contactDetail.user;
    userName = userInfo.user_name || userInfo.name || userInfo.full_name || userInfo.fullName || userInfo.username || 'N/A';
    userEmail = userInfo.email || 'N/A';
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-6 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate('/admin/contacts')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to List</span>
          </button>
          <button
            onClick={() => navigate(`/admin/contacts/${id}/edit`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 font-semibold"
          >
            <Edit className="w-4 h-4" />
            <span>Edit & Reply</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Contact Details Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-black text-gray-900 mb-4">
                  {contactDetail.subject}
                </h2>
                <div className="flex items-center gap-3 flex-wrap mb-4">
                  {getStatusBadge(contactDetail.status)}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Sent: {formatDateTime(contactDetail.created_at || contactDetail.createdAt)}</span>
                    </div>
                    {contactDetail.updated_at && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>Updated: {formatDateTime(contactDetail.updated_at || contactDetail.updatedAt)}</span>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* User Information */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Sender Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <UserCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Name</p>
                    <p className="text-base font-bold text-gray-900">{userName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <Mail className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</p>
                    <p className="text-base font-bold text-gray-900">{userEmail}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Category</h3>
              <p className="text-gray-900 font-medium">{contactDetail.category || 'N/A'}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Content</h3>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {contactDetail.message}
                </p>
              </div>
            </div>

            {/* Attachments */}
            {contactDetail.attachments && contactDetail.attachments.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Attachments</h3>
                <div className="space-y-2">
                  {contactDetail.attachments.map((attachment, index) => {
                    const fileName = attachment.file_name || attachment.fileName || `File ${index + 1}`;
                    const fileUrl = attachment.file_url || attachment.fileUrl;
                    const isImage = isImageFile(fileName);
                    
                    return (
                      <div
                        key={attachment._id || attachment.id || index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {isImage ? (
                            <ImageIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          ) : (
                            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {fileName}
                            </p>
                            {attachment.file_size && (
                              <p className="text-xs text-gray-500">
                                {(attachment.file_size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          {isImage && (
                            <button
                              onClick={() => handleViewAttachment(fileUrl, fileName)}
                              className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-110"
                              title="View Image"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDownloadAttachment(fileUrl, fileName)}
                            className="p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 hover:scale-110"
                            title="Download"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Replies Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Reply History</h3>
            </div>
            
            {/* Replies List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {repliesLoading ? (
                <div className="text-center py-12">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Loading replies...</p>
                </div>
              ) : replies.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No replies yet</p>
                </div>
              ) : (
                replies.map((reply, index) => {
                  const replyId = reply._id || reply.id;
                  const isAdminReply = reply.sender_type === 'ADMIN';
                  const isEditing = editingReplyId === replyId;

                  return (
                    <div
                      key={replyId || index}
                      className={`p-4 rounded-xl border-2 ${
                        reply.sender_type === 'USER'
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-green-50 border-green-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <UserCircle className="w-4 h-4 text-gray-600" />
                          <span className="font-bold text-sm text-gray-900">
                            {reply.sender_type === 'USER' ? 'Customer' : 'Administrator'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDateTime(reply.created_at || reply.createdAt)}</span>
                          </div>
                          {isAdminReply && !isEditing && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleStartEditReply(reply)}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteReply(replyId)}
                                className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      {isEditing ? (
                        <div className="space-y-3">
                          <textarea
                            value={editingReplyMessage}
                            onChange={(e) => setEditingReplyMessage(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg border-2 border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none resize-none"
                            autoFocus
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleSaveEditReply}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                            >
                              <Check className="w-4 h-4" />
                              <span>Save</span>
                            </button>
                            <button
                              onClick={handleCancelEditReply}
                              className="flex items-center gap-1 px-3 py-1.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm font-semibold"
                            >
                              <X className="w-4 h-4" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{reply.message}</p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDetailPage;
