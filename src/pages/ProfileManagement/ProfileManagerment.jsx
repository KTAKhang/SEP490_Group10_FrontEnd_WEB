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
  DatePicker,
  Modal,
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
import dayjs from "dayjs";
import { Users, CalendarDays } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  clearProfileMessages,
  getProfileRequest,
  updateProfileRequest,
} from "../../redux/actions/profileAction";
const API_BASE = "https://provinces.open-api.vn/api/v2";
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
  const [wards, setWards] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [icity, setIcity] = useState("");
  const [form] = Form.useForm();
  const [cityCode, setCityCode] = useState(null);
  useEffect(() => {
    axios
      .get(`${API_BASE}/p/`)
      .then((res) => setProvinces(res.data))
      .catch((err) => console.error("Error loading provinces:", err));
  }, []);

  // Load wards when selected cityCode changes
  useEffect(() => {
    if (!cityCode) {
      setWards([]);
      return;
    }

    axios
      .get(`${API_BASE}/w/`)
      .then((res) => {
        const filtered = res.data.filter(
          (ward) => ward.province_code === Number(cityCode),
        );
        setWards(filtered);
      })
      .catch((err) => console.error(err));
  }, [cityCode]);

  // When user & provinces available, parse user.address into fields
  useEffect(() => {
    if (!user || provinces.length === 0) return;

    const parts = user.address
      ? user.address.split(",").map((p) => p.trim())
      : [];
    const addr = parts[0] || "";
    const ward = parts[1] || "";
    const provinceName = parts[2] || "";

    // Try to find province by exact or partial name
    const byName = provinces.find(
      (p) =>
        p.name === provinceName ||
        p.name_with_type === provinceName ||
        (provinceName && p.name.includes(provinceName)) ||
        (provinceName && provinceName.includes(p.name)),
    );

    // Try to find by code (user.city might already be a code)
    const byCode = provinces.find(
      (p) =>
        String(p.code) === String(user.city) ||
        String(p.code) === String(parts[2]),
    );

    const province = byName || byCode;
    const code = province
      ? province.code
      : Number(user.city)
        ? Number(user.city)
        : null;

    if (code) {
      setCityCode(Number(code));
      setIcity(province ? province.name : provinceName);
    }

    // Fill form fields only when form is mounted (editMode true) so Select shows value
    if (form) {
      form.setFieldsValue({
        address: addr,
        ward: ward,
        city: code || (user.city ? Number(user.city) || user.city : undefined),
        user_name: user.user_name,
        phone: user.phone,
        gender: user.gender,
        birthday: user.birthday ? dayjs(user.birthday) : null,
      });
    }
  }, [user, provinces, form, editMode]);

  useEffect(() => {
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
  const getRoleDisplayName = (roleName = "") => {
    if (roleName === "admin") return "ADMIN";
    if (roleName === "customer") return "CUSTOMER";

    return roleName.toUpperCase();
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
    formData.append("address", `${values.address}, ${values.ward}, ${icity}`);
    formData.append("birthday", values.birthday);
    formData.append("gender", values.gender);
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
          <p className="mt-4 text-gray-600">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 text-lg">Errors: {error}</p>
          <Button
            onClick={() => {
              dispatch(getProfileRequest());
            }}
            className="mt-4"
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">User information not found.</p>
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
                            Account Information
                          </h3>
                        </div>
                      }
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          {
                            label: "User Name",
                            value: user.user_name,
                            icon: <UserOutlined className="text-green-700" />,
                          },
                          {
                            label: "Email",
                            value: user.email,
                            icon: <MailOutlined className="text-green-500" />,
                          },
                          {
                            label: "Phone",
                            value: user.phone || "Not yet updated",
                            icon: <PhoneOutlined className="text-green-700" />,
                          },
                          {
                            label: "Address",
                            value: user.address || "Not yet updated",
                            icon: <HomeOutlined className="text-green-500" />,
                          },
                          {
                            label: "Gender",
                            value: user.gender
                              ? user.gender.toUpperCase()
                              : "N/A",
                            icon: <TeamOutlined className="text-green-700" />,
                          },
                          {
                            label: "Birthday",
                            value: user.birthday
                              ? new Date(user.birthday).toLocaleDateString(
                                  "vi-VN",
                                )
                              : "N/A",
                            icon: <CalendarDays className="text-green-700" />,
                          },
                          {
                            label: "Create At",
                            value: formatDate(user.createdAt),
                            icon: <CalendarDays className="text-green-700" />,
                          },
                          {
                            label: "Update At",
                            value: formatDate(user.updatedAt),
                            icon: <CalendarDays className="text-green-500" />,
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
                            Update Profile
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
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        autoComplete="off"
                      >
                        {/* User name */}
                        <Form.Item
                          label="User Name"
                          name="user_name"
                          rules={[
                            {
                              required: true,
                              message: "Please enter your username!",
                            },
                            {
                              min: 2,
                              message:
                                "Usernames must have at least 2 characters!",
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
                          label="Phone Number"
                          name="phone"
                          rules={[
                            {
                              required: true,
                              message: "Please enter your phone number!",
                            },
                            {
                              pattern: /^[0-9]{9,11}$/,
                              message: "The phone number is invalid!",
                            },
                          ]}
                        >
                          <Input
                            size="large"
                            placeholder="Enter phone number"
                            className="rounded-xl border-2 hover:border-green-500 focus:border-green-500 transition-colors"
                          />
                        </Form.Item>

                        <Form.Item
                          label="City / Province"
                          name="city"
                          rules={[
                            {
                              required: true,
                              message: "Please select city/province!",
                            },
                          ]}
                        >
                          <Select
                            size="large"
                            placeholder="Select city/province"
                            className="rounded-xl"
                            onChange={(value) => {
                              const province = provinces.find(
                                (p) => p.code === Number(value),
                              );
                              setIcity(province ? province.name : "");
                              setCityCode(Number(value));
                              form.setFieldsValue({ ward: "" });
                            }}
                          >
                            {provinces.map((p) => (
                              <Select.Option key={p.code} value={p.code}>
                                {p.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>

                        {/* Ward */}
                        <Form.Item
                          label="Ward"
                          name="ward"
                          rules={[
                            { required: true, message: "Please select ward!" },
                          ]}
                        >
                          <Select
                            size="large"
                            placeholder="Select ward"
                            disabled={!cityCode}
                            className="rounded-xl"
                          >
                            {wards.map((w) => (
                              <Select.Option key={w.code} value={w.name}>
                                {w.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>

                        {/* Address */}
                        <Form.Item
                          label="Address"
                          name="address"
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
                        {/* Birthday */}
                        <Form.Item
                          label="Birthday"
                          name="birthday"
                          rules={[
                            {
                              required: true,
                              message: "Please select your birthday!",
                            },
                          ]}
                        >
                          <DatePicker
                            size="large"
                            className="w-full rounded-xl"
                            disabledDate={(current) =>
                              current && current > dayjs().endOf("day")
                            }
                          />
                        </Form.Item>

                        {/* Gender */}
                        <Form.Item
                          label="Gender"
                          name="gender"
                          rules={[
                            {
                              required: true,
                              message: "Please select gender!",
                            },
                          ]}
                        >
                          <Select
                            size="large"
                            placeholder="Select gender"
                            className="rounded-xl"
                          >
                            <Select.Option value="male">Male</Select.Option>
                            <Select.Option value="female">Female</Select.Option>
                            <Select.Option value="other">Other</Select.Option>
                          </Select>
                        </Form.Item>

                        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-100">
                          <Button
                            size="large"
                            danger
                            ghost
                            onClick={() => {
                              Modal.confirm({
                                title: "Discard changes?",
                                content: "Your changes will not be saved.",
                                okText: "Discard",
                                cancelText: "Continue editing",
                                onOk: () => {
                                  setEditMode(false);
                                  form.resetFields();
                                  setAvatarFile(null);
                                  setAvatarUrl(user.avatar || "");
                                  dispatch(clearProfileMessages());
                                },
                              });
                            }}
                          >
                            Cancel
                          </Button>

                          <Button
                            type="text"
                            size="large"
                            loading={updateLoading}
                            icon={<SaveOutlined />}
                            className="px-8 py-2 h-auto rounded-xl text-white bg-gradient-to-r from-green-500 via-green-600 to-green-700 border-0 hover:!text-white hover:!bg-green-800 focus:!bg-green-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                            htmlType="submit"
                          >
                            {updateLoading ? "Saving..." : "Save Updated"}
                          </Button>
                        </div>
                      </Form>
                    </Card>
                  )}
                </div>
              </Col>
              <Col
                xs={{ span: 24, order: 1 }}
                md={{ span: 8, order: 2 }}
                className="sticky top-20"
              >
                <div className="sticky top-24 space-y-6">
                  <Card className="rounded-3xl border-0 shadow-2xl hover:shadow-2xl transition-all duration-500 bg-white/90 backdrop-blur-lg overflow-visible ">
                    <div className="text-center relative sticky top-8">
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
                          type="text"
                          icon={<EditOutlined />}
                          className="mt-6 border-2 border-green-500 text-green-700 hover:!bg-green-600 hover:!text-white hover:!border-green-600 focus:!border-green-500 transition-all duration-300 rounded-xl px-6 py-2 h-auto font-medium "
                          onClick={() => setEditMode(true)}
                        >
                          Edit
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
