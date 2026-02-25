import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
// import { useAuth } from '../../contexts/AuthContext';
import {
  contactGetMyContactsRequest,
  contactGetContactDetailRequest,
  contactSendReplyRequest,
  contactDownloadAttachmentRequest,
  contactClearMessages,
} from '../../redux/actions/contactActions';
import {
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Download,
  ChevronRight,
  Plus,
  Calendar,
  User
} from 'lucide-react';

const ContactHistoryPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const { isAuthenticated } = useAuth();
  
  // Redux state
  const {
    contacts,
    contactsLoading,
    contactDetail,
    replies,
    repliesLoading,
    sendReplyLoading,
    sendReplySuccess,
  } = useSelector((state) => state.contact);
  
  const [selectedContact, setSelectedContact] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [searchParams] = useSearchParams();
  const hasAppliedContactIdFromUrl = useRef(false);

  // Fetch contacts using Redux
  useEffect(() => {
    dispatch(contactGetMyContactsRequest());
  }, [dispatch]);

  // Khi vào trang từ thông báo (URL có contactId): auto-select và mở đúng contactt
  useEffect(() => {
    const contactIdFromUrl = searchParams.get('contactId');
    if (!contactIdFromUrl || contactsLoading || hasAppliedContactIdFromUrl.current) return;
    if (contacts.length === 0) return;

    const contact = contacts.find(
      (c) => (c._id || c.id) === contactIdFromUrl
    );
    if (contact) {
      hasAppliedContactIdFromUrl.current = true;
      setSelectedContact(contact);
      setReplyMessage('');
      dispatch(contactGetContactDetailRequest(contactIdFromUrl));
    }
  }, [contacts, contactsLoading, searchParams, dispatch]);

  // Update selected contact when contactDetail changes
  useEffect(() => {
    if (contactDetail) {
      // Merge contactDetail with selectedContact to keep attachments
      setSelectedContact(prev => ({
        ...prev,
        ...contactDetail,
        attachments: contactDetail.attachments || prev?.attachments || [],
      }));
    }
  }, [contactDetail]);

  // Refresh contact detail and replies after successful reply
  useEffect(() => {
    if (sendReplySuccess && selectedContact) {
      setReplyMessage('');
      const contactId = selectedContact._id || selectedContact.id;
      // Backend returns contact with replies in one call
      // Note: saga already refreshes contacts list, so we only need to refresh detail
      dispatch(contactGetContactDetailRequest(contactId));
      // Clear success flag to prevent infinite loop
      dispatch(contactClearMessages());
    }
  }, [sendReplySuccess, selectedContact, dispatch]);

  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    setReplyMessage('');
    const contactId = contact._id || contact.id;
    // Backend returns contact with replies and attachments in one call
    dispatch(contactGetContactDetailRequest(contactId));
  };

  // Check if customer can reply (only 1 reply allowed after each admin reply)
  // Customer must wait for admin to reply again before they can reply again
  const canCustomerReply = (repliesList) => {
    if (!repliesList || repliesList.length === 0) return true;
    
    // Find the last admin reply index
    let lastAdminReplyIndex = -1;
    for (let i = repliesList.length - 1; i >= 0; i--) {
      if (repliesList[i].sender_type === 'ADMIN') {
        lastAdminReplyIndex = i;
        break;
      }
    }
    
    // If no admin reply yet, check if customer has already replied
    // If customer has replied (even without admin reply), they must wait
    if (lastAdminReplyIndex === -1) {
      // Check if there are any user replies
      const hasUserReply = repliesList.some(reply => reply.sender_type === 'USER');
      // If customer has already replied, they must wait for admin to reply first
      return !hasUserReply;
    }
    
    // Count customer replies after the last admin reply
    let customerReplyCount = 0;
    for (let i = lastAdminReplyIndex + 1; i < repliesList.length; i++) {
      if (repliesList[i].sender_type === 'USER') {
        customerReplyCount++;
      }
    }
    
    // Customer can only reply 1 time after each admin reply
    // If customer already replied, they must wait for admin to reply again
    return customerReplyCount < 1;
  };

  // Get status-specific message when customer is waiting for admin reply
  const getStatusWaitingMessage = (status) => {
    const statusMessages = {
      OPEN: {
        icon: AlertCircle,
        message: 'Waiting for administrator\'s reply. Please wait before continuing.',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-600',
        textColor: 'text-yellow-800',
      },
      IN_PROGRESS: {
        icon: Clock,
        message: 'Your contact is being processed. Please wait for administrator\'s reply.',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-600',
        textColor: 'text-blue-800',
      },
      RESOLVED: {
        icon: CheckCircle,
        message: 'Your contact has been resolved. Thank you for contacting us!',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconColor: 'text-green-600',
        textColor: 'text-green-800',
      },
      CLOSED: {
        icon: XCircle,
        message: 'This contact has been closed. Cannot send additional replies.',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-200',
        iconColor: 'text-gray-400',
        textColor: 'text-gray-600',
      },
    };

    return statusMessages[status] || statusMessages.OPEN;
  };

  const handleSendReply = () => {
    if (!selectedContact) return;

    // BR-C-06: Cannot reply when status is CLOSED
    if (selectedContact.status === 'CLOSED') {
      toast.error('Cannot send reply to closed contact');
      return;
    }

    // Check if customer can reply (limit: 1 reply after admin reply)
    if (!canCustomerReply(replies)) {
      toast.error('You have replied. Please wait for administrator\'s reply.');
      return;
    }

    if (!replyMessage.trim()) {
      toast.error('Please enter reply content');
      return;
    }

    const contactId = selectedContact._id || selectedContact.id;
    // BR-R-03: User can only send with sender_type=USER
    dispatch(contactSendReplyRequest(contactId, replyMessage.trim()));
  };

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

  const handleDownloadAttachment = (fileUrl, fileName) => {
    dispatch(contactDownloadAttachmentRequest(fileUrl, fileName));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-28 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              Contact History
            </h1>
            <p className="text-lg text-gray-600">
              View and manage your sent contacts
            </p>
          </div>
          <button
            onClick={() => navigate('/customer/contact')}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all duration-200 shadow-lg hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>New Contact</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-900">Contact List</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {contacts.length} contacts
                </p>
              </div>
              
              {contactsLoading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">Loading...</p>
                </div>
              ) : contacts.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">You have no contacts yet</p>
                  <button
                    onClick={() => navigate('/customer/contact')}
                    className="text-green-600 hover:text-green-700 font-semibold"
                  >
                    Create New Contact
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 max-h-[calc(100vh-250px)] overflow-y-auto">
                  {contacts.map((contact) => (
                    <button
                      key={contact._id || contact.id}
                      onClick={() => handleContactClick(contact)}
                      className={`w-full p-4 text-left transition-all duration-200 hover:bg-gray-50 ${
                        selectedContact?._id === contact._id || selectedContact?.id === contact.id
                          ? 'bg-green-50 border-l-4 border-green-600'
                          : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                          {contact.subject}
                        </h3>
                        <ChevronRight
                          className={`w-5 h-5 flex-shrink-0 ml-2 ${
                            selectedContact?._id === contact._id || selectedContact?.id === contact.id
                              ? 'text-green-600'
                              : 'text-gray-400'
                          }`}
                        />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(contact.status)}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(contact.created_at || contact.createdAt)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-2">
            {selectedContact ? (
              <div className="space-y-6">
                {/* Contact Details Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedContact.subject}
                      </h2>
                      <div className="flex items-center gap-3 flex-wrap">
                        {getStatusBadge(selectedContact.status)}
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>Created: {formatDate(selectedContact.created_at || selectedContact.createdAt)}</span>
                        </div>
                        {selectedContact.updated_at && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>Updated: {formatDate(selectedContact.updated_at || selectedContact.updatedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Category</h3>
                    <p className="text-gray-900">{selectedContact.category || 'N/A'}</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Content</h3>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {selectedContact.message}
                      </p>
                    </div>
                  </div>

                  {/* Attachments */}
                  {selectedContact.attachments && selectedContact.attachments.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Attachments</h3>
                      <div className="space-y-3">
                        {selectedContact.attachments.map((attachment, index) => {
                          const fileName = attachment.file_name || attachment.fileName || `File ${index + 1}`;
                          const fileUrl = attachment.file_url || attachment.fileUrl;
                          const isImage = /\.(jpg|jpeg|png|gif|bmp|webp|svg)(\?|$)/i.test(fileName);
                          return isImage ? (
                            <div
                              key={attachment._id || attachment.id || index}
                              className="p-3 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden"
                            >
                              <img
                                src={fileUrl}
                                alt={fileName}
                                className="w-full max-h-64 object-contain rounded-lg bg-white border border-gray-100"
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling?.classList.remove('hidden'); }}
                              />
                              <p className="hidden text-sm text-gray-500 mt-2">Unable to load image</p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-sm font-medium text-gray-900 truncate flex-1 min-w-0">{fileName}</p>
                                <button
                                  onClick={() => handleDownloadAttachment(fileUrl, fileName)}
                                  className="ml-2 p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors flex-shrink-0"
                                  title="Download"
                                >
                                  <Download className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div
                              key={attachment._id || attachment.id || index}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <FileText className="w-5 h-5 text-gray-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
                                  {attachment.file_size && (
                                    <p className="text-xs text-gray-500">
                                      {(attachment.file_size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleDownloadAttachment(fileUrl, fileName)}
                                className="ml-3 p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              >
                                <Download className="w-5 h-5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Replies Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Replies</h3>
                  
                  {/* Replies List */}
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {repliesLoading ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">Loading replies...</p>
                      </div>
                    ) : replies.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No replies yet
                      </p>
                    ) : (
                      replies.map((reply, index) => (
                        <div
                          key={reply._id || reply.id || index}
                          className={`p-4 rounded-xl border-2 ${
                            reply.sender_type === 'USER'
                              ? 'bg-blue-50 border-blue-200'
                              : 'bg-green-50 border-green-200'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-600" />
                              <span className="font-semibold text-sm text-gray-900">
                                {reply.sender_type === 'USER' ? 'You' : 'Administrator'}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(reply.created_at || reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-900 whitespace-pre-wrap">{reply.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Reply Form */}
                  {(() => {
                    const status = selectedContact.status;
                    
                    // Nếu status là RESOLVED hoặc CLOSED, luôn hiển thị thông báo status (không cho reply)
                    if (status === 'RESOLVED' || status === 'CLOSED') {
                      const statusMessage = getStatusWaitingMessage(status);
                      const StatusIcon = statusMessage.icon;
                      return (
                        <div className="border-t border-gray-200 pt-4">
                          <div className={`${statusMessage.bgColor} border ${statusMessage.borderColor} rounded-xl p-4 text-center`}>
                            <StatusIcon className={`w-8 h-8 ${statusMessage.iconColor} mx-auto mb-2`} />
                            <p className={`${statusMessage.textColor} font-medium`}>
                              {statusMessage.message}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    
                    // Nếu status là OPEN hoặc IN_PROGRESS
                    // Kiểm tra xem customer có thể reply không
                    if (canCustomerReply(replies)) {
                      // Customer có thể reply -> hiển thị reply form
                      return (
                        <div className="border-t border-gray-200 pt-4">
                          <div className="mb-3">
                            <textarea
                              value={replyMessage}
                              onChange={(e) => setReplyMessage(e.target.value)}
                              placeholder="Enter your reply..."
                              rows={4}
                              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-200 focus:outline-none resize-none"
                              disabled={sendReplyLoading}
                            />
                          </div>
                          <button
                            onClick={handleSendReply}
                            disabled={sendReplyLoading || !replyMessage.trim()}
                            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 ${
                              sendReplyLoading || !replyMessage.trim()
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700 shadow-lg hover:scale-105'
                            }`}
                          >
                            {sendReplyLoading ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Sending...</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-5 h-5" />
                                <span>Send Reply</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    } else {
                      // Customer không thể reply -> hiển thị thông báo đợi admin
                      const statusMessage = getStatusWaitingMessage(status);
                      const StatusIcon = statusMessage.icon;
                      return (
                        <div className="border-t border-gray-200 pt-4">
                          <div className={`${statusMessage.bgColor} border ${statusMessage.borderColor} rounded-xl p-4 text-center`}>
                            <StatusIcon className={`w-8 h-8 ${statusMessage.iconColor} mx-auto mb-2`} />
                            <p className={`${statusMessage.textColor} font-medium`}>
                              {statusMessage.message}
                            </p>
                          </div>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Select a contact to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactHistoryPage;
