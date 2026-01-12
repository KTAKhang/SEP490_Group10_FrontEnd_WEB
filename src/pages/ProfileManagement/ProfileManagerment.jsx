import {
  Card,
  Avatar,
  Row,
  Col,
  Button,
  Form,
  Input,
  Select,
  Upload,
  message,
  Switch,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  SaveOutlined,
  UploadOutlined,
  CameraOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  PhoneOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearProfileMessages,
  getProfileRequest,
  updateProfileRequest,
} from "../../redux/actions/profileAction";

const { Option } = Select;

const ProfileManager = () => {
  const dispatch = useDispatch();
  const {
    user,
    loading,
    error,
    updateLoading,
    updateError,
    updateSuccess,
    updateMessage,
  } = useSelector((state) => state.profile);

  const [editMode, setEditMode] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    console.log("alo");
    dispatch(getProfileRequest());
    dispatch(clearProfileMessages());
  }, [dispatch]);

  useEffect(() => {
    if (updateSuccess && updateSuccess.data) {
      setEditMode(false);
      setAvatarFile(null);
    }
    dispatch(clearProfileMessages());
  }, [updateSuccess]);

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  // Role display mapping
  const getRoleDisplayName = (roleName) => {
    const roleMap = {
      admin: "Quản trị viên",
      customer: "Khách hàng",
      "sales-staff": "Nhân viên bán hàng",
      "repair-staff": "Nhân viên sửa chữa",
    };
    return roleMap[roleName] || roleName;
  };

  // Handle avatar upload
  const handleAvatarChange = (info) => {
    if (info.fileList.length > 0) {
      const file = info.file;
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const uploadProps = {
    name: "avatar",
    listType: "picture",
    showUploadList: false,
    accept: "image/*",
    beforeUpload: (file) => {
      const isJpgOrPng =
        file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        message.error("Chỉ có thể tải lên file JPG/PNG!");
        return Upload.LIST_IGNORE;
      }
      const isLt3M = file.size / 1024 / 1024 < 3;
      if (!isLt3M) {
        message.error("Kích thước ảnh phải nhỏ hơn 3MB!");
        return Upload.LIST_IGNORE;
      }
      message.success("Tải ảnh đại diện thành công!");
      return false;
    },
    onChange: handleAvatarChange,
  };
  useEffect(() => {
    if (updateSuccess) {
      message.success("Cập nhật thành công!");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      dispatch(clearProfileMessages());
    }
    if (error) {
      message.error(error);
    }
  }, [updateSuccess, error]);

  const handleSubmit = async (values) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userId = storedUser ? storedUser._id : null;

    if (!userId) {
      message.error("Không tìm thấy thông tin người dùng!");
      return;
    }

    // Sử dụng FormData để hỗ trợ cả file lẫn text
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("user_name", values.user_name);
    formData.append("phone", values.phone);
    formData.append("address", values.address);

    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    // Gửi request lên server
    dispatch(updateProfileRequest(formData));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#13C2C2]"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 text-lg">Có lỗi xảy ra: {error}</p>
          <Button
            onClick={() => {
              dispatch(getProfileRequest());
            }}
            className="mt-4"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy thông tin người dùng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white mt-20">
      <div className="flex-1 bg-white">
        <div className="p-8">
          <div className="max-w-7xl mx-auto space-y-8">

            <Row gutter={[24, 24]} className="items-start">
              <Col xs={{ span: 24, order: 2 }} md={{ span: 16, order: 1 }}>
                <div>
                  {!editMode ? (
                    <Card
                      className="rounded-3xl border-0 shadow-2xl hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-lg"
                      title={
                        <div className="flex items-center space-x-3 py-2">
                          <div className="w-1 h-8 bg-gradient-to-b from-green-700 via-green-500 to-green-700 rounded-full"></div>
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-transparent">
                            Thông tin tài khoản
                          </h3>
                        </div>
                      }
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          {
                            label: "Tên người dùng",
                            value: user.user_name,
                            icon: <UserOutlined className="text-green-700" />,
                          },
                          {
                            label: "Email",
                            value: user.email,
                            icon: <MailOutlined className="text-green-500" />,
                          },
                          {
                            label: "Số điện thoại",
                            value: user.phone || "Chưa cập nhật",
                            icon: <PhoneOutlined className="text-green-700" />,
                          },
                          {
                            label: "Địa chỉ",
                            value: user.address || "Chưa cập nhật",
                            icon: <HomeOutlined className="text-green-500" />,
                          },
                          {
                            label: "Vai trò",
                            value: getRoleDisplayName(user.role_name),
                            icon: <TeamOutlined className="text-green-700" />,
                          },
                          {
                            label: "Trạng thái",
                            value: user.status
                              ? "Hoạt động"
                              : "Không hoạt động",
                            icon: (
                              <CheckCircleOutlined className="text-green-500" />
                            ),
                          },
                          {
                            label: "Ngày tạo",
                            value: formatDate(user.createdAt),
                            icon: <UserOutlined className="text-green-700" />,
                          },
                          {
                            label: "Cập nhật lần cuối",
                            value: formatDate(user.updatedAt),
                            icon: <UserOutlined className="text-green-500" />,
                          },
                        ].map((item, index) => (
                          <div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            key={item.label}
                            className="relative group overflow-hidden rounded-xl bg-gradient-to-br from-white to-green-50 hover:from-green-100 hover:to-green-50 transition-all duration-300 border border-gray-100 hover:border-green-300 shadow-lg hover:shadow-md p-4"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-green-100 via-green-50 to-green-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative flex items-center space-x-4">
                              <div className="p-3 rounded-lg bg-white shadow-sm group-hover:shadow group-hover:scale-105 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-green-100 group-hover:to-green-50">
                                {item.icon}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-500 font-medium">
                                  {item.label}
                                </p>
                                <p className="text-base text-gray-900 font-semibold mt-1 group-hover:text-green-700 transition-colors duration-300">
                                  {item.value || "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ) : (
                    <Card
                      className="rounded-3xl border-0 shadow-2xl hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-lg"
                      title={
                        <div className="flex items-center space-x-3 py-2">
                          <div className="w-1 h-8 bg-gradient-to-b from-green-700 via-green-500 to-green-700 rounded-full"></div>
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-transparent">
                            Chỉnh sửa thông tin
                          </h3>
                        </div>
                      }
                    >
                      {console.log("updateError", updateError)}
                      {console.log("updateMessage", updateMessage)}
                      {updateError && (
                        <div className="mb-5 p-4 rounded-xl border border-red-300 bg-red-50 text-red-700 flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                            />
                          </svg>
                          <span className="font-medium">{updateMessage}</span>
                        </div>
                      )}

                      <Form
                        layout="vertical"
                        onFinish={handleSubmit}
                        autoComplete="off"
                      >
                        {/* User name */}
                        <Form.Item
                          label="Tên người dùng"
                          name="user_name"
                          initialValue={user.user_name}
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập tên người dùng!",
                            },
                            {
                              min: 2,
                              message:
                                "Tên người dùng phải có ít nhất 2 ký tự!",
                            },
                          ]}
                        >
                          <Input
                            size="large"
                            className="rounded-xl border-2 hover:border-green-500 focus:border-green-500 transition-colors"
                          />
                        </Form.Item>

                        {/* Phone */}
                        <Form.Item
                          label="Số điện thoại"
                          name="phone"
                          initialValue={user.phone}
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập số điện thoại!",
                            },
                            {
                              pattern: /^[0-9]{9,11}$/,
                              message: "Số điện thoại không hợp lệ!",
                            },
                          ]}
                        >
                          <Input
                            size="large"
                            placeholder="Nhập số điện thoại"
                            className="rounded-xl border-2 hover:border-green-500 focus:border-green-500 transition-colors"
                          />
                        </Form.Item>

                        {/* Address */}
                        <Form.Item
                          label="Địa chỉ"
                          name="address"
                          initialValue={user.address}
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập địa chỉ!",
                            },
                            {
                              min: 5,
                              message: "Địa chỉ phải có ít nhất 5 ký tự!",
                            },
                          ]}
                        >
                          <Input.TextArea
                            rows={3}
                            placeholder="Nhập địa chỉ"
                            className="rounded-xl border-2 hover:border-green-500 focus:border-green-500 transition-colors"
                          />
                        </Form.Item>

                        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-100">
                          <Button
                            size="large"
                            className="px-8 py-2 h-auto rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-colors"
                            onClick={() => {
                              setEditMode(false);
                              setAvatarFile(null);
                              setAvatarUrl(user.avatar || "");
                              dispatch(clearProfileMessages());
                            }}
                          >
                            Hủy
                          </Button>
                          <Button
                            type="primary"
                            size="large"
                            loading={updateLoading}
                            icon={<SaveOutlined />}
                            className="px-8 py-2 h-auto rounded-xl bg-gradient-to-r from-green-700 via-green-500 to-green-700 border-0 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                            htmlType="submit"
                          >
                            {updateLoading ? "Đang lưu..." : "Lưu thay đổi"}
                          </Button>
                        </div>
                      </Form>
                    </Card>
                  )}
                </div>
              </Col>
              <Col xs={{ span: 24, order: 1 }} md={{ span: 8, order: 2 }}>
                <div className="sticky top-24 space-y-6">
                  <Card className="rounded-3xl border-0 shadow-2xl hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-lg overflow-visible">
                    <div className="text-center relative">
                      {/* Avatar Container with animation */}
                      <div className="relative inline-block group">
                        {/* Animated rings */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-green-500 via-green-700 to-green-500 rounded-full blur-lg opacity-20 group-hover:opacity-30 animate-pulse"></div>
                        <div className="absolute -inset-4 bg-gradient-to-r from-green-700 via-green-500 to-green-700 rounded-full blur opacity-20 group-hover:opacity-30"></div>
                        {/* Avatar or Upload */}
                        {editMode ? (
                          <Upload accept="image/*" {...uploadProps}>
                            <div className="relative cursor-pointer">
                              <Avatar
                                size={160}
                                src={avatarUrl || user.avatar}
                                icon={
                                  !avatarUrl && !user.avatar && <UserOutlined />
                                }
                                className="ring-8 ring-white shadow-2xl border-4 border-gray-100 group-hover:scale-105 transition-all duration-500 relative z-10"
                              />
                              {/* Camera overlay */}
                              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                                <CameraOutlined className="text-white text-2xl" />
                              </div>
                            </div>
                          </Upload>
                        ) : (
                          <Avatar
                            size={160}
                            src={user.avatar}
                            icon={!user.avatar && <UserOutlined />}
                            className="ring-8 ring-white shadow-2xl border-4 border-gray-100 group-hover:scale-105 transition-all duration-500 relative z-10"
                          />
                        )}
                        {/* Role Badge with animation */}
                        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-20">
                          <div className="px-6 py-2 bg-gradient-to-r from-green-700 via-green-500 to-green-700 text-white rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 whitespace-nowrap">
                            {getRoleDisplayName(user.role_name)}
                          </div>
                        </div>
                      </div>
                      {/* User Info with animation */}
                      <div className="mt-12 space-y-3">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-700 via-green-500 to-green-700 bg-clip-text text-transparent">
                          {user.user_name}
                        </h2>
                        <p className="text-gray-500 font-medium">
                          {user.email}
                        </p>
                      </div>
                      {/* Nút chỉnh sửa */}
                      {!editMode && (
                        <Button
                          icon={<EditOutlined />}
                          className="mt-6 border-2 border-green-500 text-green-700 hover:bg-green-500 focus:border-green-500 hover:text-white hover:border-green-600 transition-all duration-300 rounded-xl px-6 py-2 h-auto font-medium"
                          onClick={() => setEditMode(true)}
                        >
                          Chỉnh sửa
                        </Button>
                      )}
                    </div>
                  </Card>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileManager;
