import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import {
  getMyContactsRequest,
  getContactDetailRequest,
  sendReplyRequest,
  downloadAttachmentRequest,
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
  const { isAuthenticated } = useAuth();
  
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

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Fetch contacts using Redux
  useEffect(() => {
    dispatch(getMyContactsRequest());
  }, [dispatch]);

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
      dispatch(getContactDetailRequest(contactId));
      dispatch(getMyContactsRequest()); // Refresh contacts list
    }
  }, [sendReplySuccess, selectedContact, dispatch]);

  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    setReplyMessage('');
    const contactId = contact._id || contact.id;
    // Backend returns contact with replies and attachments in one call
    dispatch(getContactDetailRequest(contactId));
  };

  const handleSendReply = () => {
    if (!selectedContact) return;

    // BR-C-06: Cannot reply when status is CLOSED
    if (selectedContact.status === 'CLOSED') {
      toast.error('Không thể gửi phản hồi cho liên hệ đã đóng');
      return;
    }

    if (!replyMessage.trim()) {
      toast.error('Vui lòng nhập nội dung phản hồi');
      return;
    }

    const contactId = selectedContact._id || selectedContact.id;
    // BR-R-03: User can only send with sender_type=USER
    dispatch(sendReplyRequest(contactId, replyMessage.trim()));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      OPEN: { label: 'Mở', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
      IN_PROGRESS: { label: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      RESOLVED: { label: 'Đã giải quyết', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      CLOSED: { label: 'Đã đóng', color: 'bg-gray-100 text-gray-800', icon: XCircle },
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
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDownloadAttachment = (fileUrl, fileName) => {
    dispatch(downloadAttachmentRequest(fileUrl, fileName));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
              Lịch Sử Liên Hệ
            </h1>
            <p className="text-lg text-gray-600">
              Xem và quản lý các liên hệ bạn đã gửi
            </p>
          </div>
          <button
            onClick={() => navigate('/customer/contact')}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all duration-200 shadow-lg hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Liên hệ mới</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-900">Danh sách liên hệ</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {contacts.length} liên hệ
                </p>
              </div>
              
              {contactsLoading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">Đang tải...</p>
                </div>
              ) : contacts.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Bạn chưa có liên hệ nào</p>
                  <button
                    onClick={() => navigate('/customer/contact')}
                    className="text-green-600 hover:text-green-700 font-semibold"
                  >
                    Tạo liên hệ mới
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
                      <h2 className="text-2xl font-black text-gray-900 mb-2">
                        {selectedContact.subject}
                      </h2>
                      <div className="flex items-center gap-3 flex-wrap">
                        {getStatusBadge(selectedContact.status)}
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>Tạo: {formatDate(selectedContact.created_at || selectedContact.createdAt)}</span>
                        </div>
                        {selectedContact.updated_at && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>Cập nhật: {formatDate(selectedContact.updated_at || selectedContact.updatedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Danh mục</h3>
                    <p className="text-gray-900">{selectedContact.category || 'N/A'}</p>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Nội dung</h3>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {selectedContact.message}
                      </p>
                    </div>
                  </div>

                  {/* Attachments */}
                  {selectedContact.attachments && selectedContact.attachments.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Tệp đính kèm</h3>
                      <div className="space-y-2">
                        {selectedContact.attachments.map((attachment, index) => (
                          <div
                            key={attachment._id || attachment.id || index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <FileText className="w-5 h-5 text-gray-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {attachment.file_name || attachment.fileName || `File ${index + 1}`}
                                </p>
                                {attachment.file_size && (
                                  <p className="text-xs text-gray-500">
                                    {(attachment.file_size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDownloadAttachment(
                                attachment.file_url || attachment.fileUrl,
                                attachment.file_name || attachment.fileName || `attachment-${index + 1}`
                              )}
                              className="ml-3 p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <Download className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Replies Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Phản hồi</h3>
                  
                  {/* Replies List */}
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {repliesLoading ? (
                      <div className="text-center py-8">
                        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">Đang tải phản hồi...</p>
                      </div>
                    ) : replies.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        Chưa có phản hồi nào
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
                                {reply.sender_type === 'USER' ? 'Bạn' : 'Quản trị viên'}
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
                  {selectedContact.status !== 'CLOSED' ? (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="mb-3">
                        <textarea
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Nhập phản hồi của bạn..."
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
                            <span>Đang gửi...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            <span>Gửi phản hồi</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="bg-gray-100 rounded-xl p-4 text-center">
                        <XCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 font-medium">
                          Liên hệ này đã được đóng. Không thể gửi thêm phản hồi.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Chọn một liên hệ để xem chi tiết</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactHistoryPage;
