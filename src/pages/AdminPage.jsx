import { useState, useEffect, useCallback } from "react";
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Row, Col, Typography, Input, Button, Spin, Badge, DatePicker, Modal } from "antd";
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  TeamOutlined,
  GiftOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { fetchDashboardDataRequest, exportDashboardExcelRequest } from '../redux/actions/statisticsActions';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

// Helper function to get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { dashboardData, loading, error, exporting } = useSelector(state => state.statistics);
  
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredStat, setHoveredStat] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedCustomerDate, setSelectedCustomerDate] = useState(getCurrentDate());
  const [showCustomerDateModal, setShowCustomerDateModal] = useState(false);

  // Helper function to compare dates safely
  const isSameDate = (date1, date2) => {
    if (!date1 || !date2) return false;
    try {
      const d1 = new Date(date1).toISOString().split('T')[0];
      const d2 = new Date(date2).toISOString().split('T')[0];
      return d1 === d2;
    } catch {
      return false;
    }
  };

  // Function to fetch dashboard data from API
  const refreshDashboardData = useCallback(() => {
    dispatch(fetchDashboardDataRequest(selectedYear));
  }, [dispatch, selectedYear]);

  // Load dashboard data on component mount
  useEffect(() => {
    refreshDashboardData();
  }, [refreshDashboardData]);

  // Function to handle year change
  const handleYearChange = () => {
    refreshDashboardData();
  };

  // Function to handle Excel export
  const handleExportExcel = () => {
    dispatch(exportDashboardExcelRequest(selectedYear));
  };

  // Transform data for chart
  const areaData = dashboardData?.revenueByMonth?.length > 0
    ? dashboardData.revenueByMonth.map((item) => ({
      month: `Tháng ${item.month}`,
      DoanhThu: item.totalRevenue, 
    }))
    : [];

  // Calculate max revenue for dynamic scaling
  const maxRevenue = areaData.length > 0 
    ? Math.max(...areaData.map(item => item.DoanhThu))
    : 1;

  // Format currency for display
  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`; // Triệu
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`; // Nghìn
    }
    return value.toString();
  };

  // Calculate bar height with minimum for visibility
  const getBarHeight = (value) => {
    if (value === 0) return 0;
    if (maxRevenue === 0) return 0;
    
    const percentage = (value / maxRevenue) * 100;
    // Minimum 3% height if there's any value, max 95%
    return Math.min(Math.max(percentage, 3), 95);
  };

  // Get today's actual data
  const getTodayRevenue = () => {
    if (dashboardData?.revenueByDate && dashboardData.revenueByDate.length > 0) {
      const today = getCurrentDate();
      const todayData = dashboardData.revenueByDate.find(item => {
        const isToday = isSameDate(item.date, today);
        return isToday;
      });
      return todayData?.totalRevenue || 0;
    }
    return 0;
  };

  const getTodayNewCustomers = () => {
    if (dashboardData?.newCustomers && dashboardData.newCustomers.length > 0) {
      const todayData = dashboardData.newCustomers.find(item => {
        const isToday = isSameDate(item.date, selectedCustomerDate);
        return isToday;
      });
      return todayData?.newCustomers || todayData?.newCustomerCount || todayData?.count || todayData?.totalNewCustomers || 0;
    }
    return 0;
  };

  // Format date for display
  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Handle customer date change
  const handleCustomerDateChange = (date) => {
    if (date && date.isValid()) {
      // Convert dayjs to YYYY-MM-DD format
      const formattedDate = date.format('YYYY-MM-DD');
      setSelectedCustomerDate(formattedDate);
      setShowCustomerDateModal(false);
      // Refresh data with new date
      dispatch(fetchDashboardDataRequest(selectedYear, formattedDate));
    }
  };

  const getTodaySales = () => {
    if (dashboardData?.salesByDate && dashboardData.salesByDate.length > 0) {
      const today = getCurrentDate();
      const todayData = dashboardData.salesByDate.find(item => {
        const isToday = isSameDate(item.date, today);
        return isToday;
      });
      return todayData?.totalSoldQuantity || todayData?.totalOrders || todayData?.totalAmount || todayData?.orderCount || 0;
    }
    return 0;
  };

  const cardStats = [
    {
      title: "Doanh thu hôm nay",
      value: getTodayRevenue(),
      icon: <DollarOutlined style={{ fontSize: 28 }} />,
      bgColor: "linear-gradient(135deg, #13C2C2 0%, #0D364C 100%)",
    },
    {
      title: selectedCustomerDate === getCurrentDate() 
        ? "Khách hàng mới hôm nay" 
        : `Khách hàng mới ${formatDisplayDate(selectedCustomerDate)}`,
      value: getTodayNewCustomers(),
      icon: <UserOutlined style={{ fontSize: 28 }} />,
      bgColor: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
      hasDatePicker: true,
      onCardClick: () => setShowCustomerDateModal(true),
    },
    {
      title: "Doanh số hôm nay",
      value: getTodaySales(),
      icon: <ShoppingCartOutlined style={{ fontSize: 28 }} />,
      bgColor: "linear-gradient(135deg, #fa8c16 0%, #d4380d 100%)",
    },
    {
      title: "Đơn hàng chờ xử lý",
      value: dashboardData?.pendingOrdersCount || 0,
      icon: <ClockCircleOutlined style={{ fontSize: 28 }} />,
      bgColor: "linear-gradient(135deg, #722ed1 0%, #531dab 100%)",
    },
  ];

  // Calculate total revenue including sales + repair
  const calculateTotalRevenue = () => {
    const salesRevenue = dashboardData?.overview?.totalRevenue || 0;
    const repairRevenue = (dashboardData?.repairRevenueByYear || []).reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
    return salesRevenue + repairRevenue;
  };

  const summaryStats = [
    {
      label: 'Tổng người dùng',
      value: dashboardData?.overview?.totalUsers ? dashboardData.overview.totalUsers.toLocaleString() : '0',
      icon: <TeamOutlined style={{ fontSize: 20 }} />,
      color: '#13C2C2'
    },
    {
      label: 'Tổng đơn hàng',
      value: dashboardData?.overview?.totalOrders ? dashboardData.overview.totalOrders.toLocaleString() : '0',
      icon: <ShoppingCartOutlined style={{ fontSize: 20 }} />,
      color: '#52C41A'
    },
    {
      label: 'Tổng doanh thu',
      value: calculateTotalRevenue().toLocaleString(),
      icon: <DollarOutlined style={{ fontSize: 20 }} />,
      color: '#FA8C16'
    },
    {
      label: 'Tổng sản phẩm',
      value: dashboardData?.overview?.totalProducts ? dashboardData.overview.totalProducts.toLocaleString() : '0',
      icon: <GiftOutlined style={{ fontSize: 20 }} />,
      color: '#722ED1'
    }
  ];

  const StatCard = ({ stat, index }) => (
    <Card
      onClick={stat.onCardClick}
      onMouseEnter={() => setHoveredCard(index)}
      onMouseLeave={() => setHoveredCard(null)}
      style={{
        borderRadius: 20,
        border: "none",
        background: stat.bgColor,
        boxShadow: hoveredCard === index
          ? "0 20px 40px rgba(13, 54, 76, 0.3)"
          : "0 8px 24px rgba(13, 54, 76, 0.15)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hoveredCard === index ? "translateY(-8px)" : "translateY(0)",
        overflow: "hidden",
        position: "relative",
        cursor: stat.onCardClick ? "pointer" : "default",
      }}
      bodyStyle={{ padding: "24px" }}
    >
      <div style={{
        position: "absolute",
        top: -50,
        right: -50,
        width: 100,
        height: 100,
        background: "rgba(255,255,255,0.1)",
        borderRadius: "50%"
      }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: 700 }}>
              {stat.title}
            </Text>
            {stat.hasDatePicker && (
              <CalendarOutlined style={{ color: "rgba(255,255,255,0.9)", fontSize: 14 }} />
            )}
          </div>
          <div style={{
            fontSize: 28,
            fontWeight: 700,
            color: "white",
            marginTop: 8,
            marginBottom: 10
          }}>
            {stat.value.toLocaleString()}
          </div>
        </div>
        <div style={{
          color: "rgba(255,255,255,0.9)",
          background: "rgba(255,255,255,0.2)",
          padding: "12px",
          borderRadius: "12px",
          backdropFilter: "blur(10px)"
        }}>
          <div style={{ fontSize: "24px" }}>
            {stat.icon}
          </div>
        </div>
      </div>
    </Card>
  );

  StatCard.propTypes = {
    stat: PropTypes.shape({
      title: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      icon: PropTypes.element.isRequired,
      bgColor: PropTypes.string.isRequired,
      hasDatePicker: PropTypes.bool,
      onCardClick: PropTypes.func,
    }).isRequired,
    index: PropTypes.number.isRequired,
  };

  // Show loading spinner if data is being fetched
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f9ff 0%, #e0f7fa 100%)",
        padding: "24px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f0f9ff 0%, #e0f7fa 100%)",
      padding: "24px"
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <Title level={2} style={{ color: "#0D364C", marginBottom: 8 }}>
            Dashboard Quản Trị
          </Title>
          <Text style={{ color: "#13C2C2", fontSize: 16 }}>
            Tổng quan hoạt động kinh doanh hôm nay
          </Text>
        </div>
        <Button 
          type="primary" 
          onClick={handleExportExcel}
          loading={exporting}
          icon={<DownloadOutlined />}
          style={{ 
            background: "#13C2C2", 
            borderColor: "#13C2C2",
            height: 40,
            fontSize: 16
          }}
        >
          📊 Xuất báo cáo Excel
        </Button>
      </div>

      {/* Stats Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        {cardStats.map((stat, index) => (
          <Col xs={24} sm={12} md={12} lg={6} xl={6} key={index}>
            <div
              style={{
                opacity: 0,
                transform: "translateY(30px)",
                animation: `slideInUp 0.6s ease-out ${index * 0.1}s forwards`,
              }}
            >
              <StatCard stat={stat} index={index} />
            </div>
          </Col>
        ))}
      </Row>

      {/* Revenue Charts Section - Sales and Repair side by side */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            style={{
              borderRadius: 20,
              border: `2px solid #13C2C2`,
              boxShadow: "0 8px 32px rgba(19, 194, 194, 0.1)",
              background: "white",
              height: "480px",
            }}
            bodyStyle={{ padding: "32px" }}
          >
            <div style={{ marginBottom: 24 }}>
              <Title level={4} style={{ color: "#0D364C", marginBottom: 8 }}>
                Tổng quan doanh thu bán hàng
              </Title>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                <Badge color="#13C2C2" text="Doanh thu" />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Text style={{ color: "#13C2C2", fontSize: 14 }}>Năm:</Text>
                  <Input
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value) || 2025)}
                    style={{ width: 80 }}
                    min={2020}
                    max={2030}
                  />
                  <Button
                    type="primary"
                    size="small"
                    onClick={handleYearChange}
                    style={{
                      background: "#13C2C2",
                      borderColor: "#13C2C2"
                    }}
                  >
                    Cập nhật
                  </Button>
                </div>
              </div>
            </div>

            {/* Simple Chart Visualization */}
            <div style={{
              height: "calc(480px - 200px)",
              position: "relative",
              minHeight: "200px"
            }}>
              {areaData.map((item, index) => {
                const barHeight = getBarHeight(item.DoanhThu);
                const hasData = item.DoanhThu > 0;
                
                return (
                  <div key={index} style={{
                    position: "absolute",
                    bottom: 30,
                    left: `${(index / (areaData.length - 1)) * 90}%`,
                    width: "8px",
                    height: `${barHeight}%`,
                    background: hasData 
                      ? "linear-gradient(to top, #0D364C, #13C2C2)"
                      : "transparent",
                    borderRadius: "4px 4px 0 0",
                    transition: "all 0.3s ease",
                    marginRight: "4px",
                    opacity: hasData ? 1 : 0.3
                  }}>
                    {hasData && (
                      <div style={{
                        position: "absolute",
                        top: -20,
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: "10px",
                        color: "#0D364C",
                        fontWeight: "600",
                        whiteSpace: "nowrap"
                      }}>
                        {formatCurrency(item.DoanhThu)}
                      </div>
                    )}
                  </div>
                );
              })}
              {/* Month Labels */}
              {areaData.map((item, index) => (
                <div key={`month-${index}`} style={{
                  position: "absolute",
                  bottom: 5,
                  left: `${(index / (areaData.length - 1)) * 90}%`,
                  transform: "translateX(-50%)",
                  fontSize: "11px",
                  color: "#13C2C2",
                  fontWeight: "500",
                  textAlign: "center"
                }}>
                  T{index + 1}
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            style={{
              borderRadius: 20,
              border: `2px solid #FA8C16`,
              boxShadow: "0 8px 32px rgba(250, 140, 22, 0.15)",
              background: "white",
              height: "480px",
            }}
            bodyStyle={{ padding: "32px" }}
          >
            <div style={{ marginBottom: 24 }}>
              <Title level={4} style={{ color: "#0D364C", marginBottom: 8 }}>
                Tổng quan doanh thu sửa chữa
              </Title>
              <Text style={{ color: "#FA8C16", fontSize: 14, fontWeight: 500 }}>
                Doanh thu từ dịch vụ sửa chữa theo tháng
              </Text>
            </div>

            {/* Simple Chart Visualization for Repair */}
            <div style={{
              height: "calc(480px - 200px)",
              position: "relative",
              minHeight: "200px"
            }}>
              {(dashboardData?.repairRevenueByYear || []).map((item, index) => {
                const maxRepairRevenue = Math.max(...(dashboardData?.repairRevenueByYear || []).map(i => i.totalRevenue)) || 1;
                const barHeight = item.totalRevenue > 0 
                  ? Math.min(Math.max((item.totalRevenue / maxRepairRevenue) * 100, 3), 95)
                  : 0;
                const hasData = item.totalRevenue > 0;

                return (
                  <div key={index} style={{
                    position: "absolute",
                    bottom: 30,
                    left: `${(index / 11) * 90}%`,
                    width: "8px",
                    height: `${barHeight}%`,
                    background: hasData 
                      ? "linear-gradient(to top, #FA8C16, #d4380d)"
                      : "transparent",
                    borderRadius: "4px 4px 0 0",
                    transition: "all 0.3s ease",
                    marginRight: "4px",
                    opacity: hasData ? 1 : 0.3
                  }}>
                    {hasData && (
                      <div style={{
                        position: "absolute",
                        top: -20,
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: "10px",
                        color: "#0D364C",
                        fontWeight: "600",
                        whiteSpace: "nowrap"
                      }}>
                        {formatCurrency(item.totalRevenue)}
                      </div>
                    )}
                  </div>
                );
              })}
              {/* Month Labels */}
              {(dashboardData?.repairRevenueByYear || []).map((item, index) => (
                <div key={`month-${index}`} style={{
                  position: "absolute",
                  bottom: 5,
                  left: `${(index / 11) * 90}%`,
                  transform: "translateX(-50%)",
                  fontSize: "11px",
                  color: "#FA8C16",
                  fontWeight: "600"
                }}>
                  T{item.month}
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Summary Stats Section */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card
            style={{
              borderRadius: 20,
              border: `2px solid #13C2C2`,
              boxShadow: "0 8px 32px rgba(19, 194, 194, 0.15)",
              background: "linear-gradient(135deg, #f0f9ff 0%, #e0f7fa 100%)",
            }}
            bodyStyle={{ padding: 0 }}
          >
            {/* Enhanced Header */}
            <div style={{
              background: "linear-gradient(135deg, #13C2C2 0%, #0D364C 100%)",
              padding: "32px 32px 24px 32px",
              borderBottom: "none"
            }}>
              <Title level={4} style={{ color: "white", marginBottom: 8 }}>
                Tổng thống kê
              </Title>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
                Cập nhật theo thời gian thực
              </Text>
            </div>

            {/* Enhanced Stats Content */}
            <div style={{
              padding: "24px 32px 32px 32px",
              background: "white",
              flex: 1
            }}>
              <Row gutter={[24, 24]}>
                {summaryStats.map((stat, index) => (
                  <Col xs={24} sm={12} lg={6} key={index}>
                    <div
                      onMouseEnter={() => setHoveredStat(index)}
                      onMouseLeave={() => setHoveredStat(null)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "20px 24px",
                        borderRadius: "16px",
                        background: hoveredStat === index
                          ? `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}08 100%)`
                          : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                        cursor: "pointer",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        transform: hoveredStat === index ? "translateY(-2px) scale(1.02)" : "translateY(0) scale(1)",
                        border: `2px solid ${hoveredStat === index ? stat.color : "rgba(13, 54, 76, 0.1)"}`,
                        boxShadow: hoveredStat === index
                          ? `0 8px 25px ${stat.color}20`
                          : "0 2px 8px rgba(13, 54, 76, 0.08)",
                        animation: `fadeInLeft 0.6s ease-out ${index * 0.1}s forwards`,
                        opacity: 0,
                        textAlign: "center",
                        gap: 12
                      }}
                    >
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 52,
                        height: 52,
                        borderRadius: "16px",
                        background: hoveredStat === index
                          ? `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}cc 100%)`
                          : `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}15 100%)`,
                        color: hoveredStat === index ? "white" : stat.color,
                        transition: "all 0.3s ease",
                        transform: hoveredStat === index ? "scale(1.1) rotate(5deg)" : "scale(1) rotate(0deg)",
                        boxShadow: hoveredStat === index
                          ? `0 4px 15px ${stat.color}40`
                          : "0 2px 8px rgba(0,0,0,0.1)"
                      }}>
                        {stat.icon}
                      </div>
                      <div>
                        <Text style={{
                          color: "#0D364C",
                          fontSize: 14,
                          fontWeight: 600,
                          display: "block",
                          marginBottom: 4
                        }}>
                          {stat.label}
                        </Text>
                        <Text style={{
                          color: hoveredStat === index ? stat.color : "#0D364C",
                          fontSize: 24,
                          fontWeight: 700,
                          transition: "all 0.3s ease",
                          display: "block",
                          textShadow: hoveredStat === index ? `0 2px 4px ${stat.color}20` : "none"
                        }}>
                          {stat.value}
                        </Text>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>

            {/* Bottom accent line */}
            <div style={{
              height: 6,
              background: "linear-gradient(90deg, #13C2C2 0%, #52C41A 25%, #FA8C16 50%, #722ED1 75%, #13C2C2 100%)",
              borderRadius: "0 0 18px 18px"
            }} />
          </Card>
        </Col>
      </Row>

      {/* Top Selling Products Section */}
      {dashboardData?.topProducts && dashboardData.topProducts.length > 0 && (
        <>
          <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
            <Col span={24}>
              <Card
              style={{
                borderRadius: 20,
                border: `2px solid #13C2C2`,
                boxShadow: "0 8px 32px rgba(19, 194, 194, 0.15)",
                background: "linear-gradient(135deg, #f0f9ff 0%, #e0f7fa 100%)",
              }}
              bodyStyle={{ padding: "32px", background: "white", margin: "4px", borderRadius: "16px" }}
            >
              <div style={{ marginBottom: 32 }}>
                <Title level={4} style={{ color: "#0D364C", marginBottom: 8, fontSize: 22, fontWeight: 700 }}>
                  Sản phẩm bán chạy nhất
                </Title>
                <Text style={{ color: "#13C2C2", fontSize: 16, fontWeight: 500 }}>
                  Top sản phẩm có doanh thu cao nhất
                </Text>
              </div>

              <Row gutter={[16, 16]}>
                {dashboardData.topProducts.map((product, index) => (
                  <Col xs={24} sm={12} lg={8} key={product.productId}>
                    <Card
                      style={{
                        borderRadius: 20,
                        border: `2px solid ${index === 0 ? '#13C2C2' : index === 1 ? '#52C41A' : '#FA8C16'}`,
                        boxShadow: `0 8px 25px ${index === 0 ? 'rgba(19, 194, 194, 0.15)' : index === 1 ? 'rgba(82, 196, 26, 0.15)' : 'rgba(250, 140, 22, 0.15)'}`,
                        background: `linear-gradient(135deg, ${index === 0 ? '#f0f9ff' : index === 1 ? '#f6ffed' : '#fff7e6'} 0%, ${index === 0 ? '#e0f7fa' : index === 1 ? '#f6ffed' : '#fff2e8'} 100%)`,
                        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        height: "100%",
                        ":hover": {
                          transform: "translateY(-8px) scale(1.02)",
                          boxShadow: `0 12px 40px ${index === 0 ? 'rgba(19, 194, 194, 0.25)' : index === 1 ? 'rgba(82, 196, 26, 0.25)' : 'rgba(250, 140, 22, 0.25)'}`
                        }
                      }}
                      bodyStyle={{ padding: "24px", background: "white", margin: "3px", borderRadius: "16px", height: "calc(100% - 6px)", display: "flex", flexDirection: "column" }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, minHeight: 90 }}>
                        <div style={{
                          width: 70,
                          height: 70,
                          flexShrink: 0,
                          borderRadius: 20,
                          background: `linear-gradient(135deg, ${index === 0 ? '#13C2C2' : index === 1 ? '#52C41A' : '#FA8C16'} 0%, ${index === 0 ? '#0D364C' : index === 1 ? '#389e0d' : '#d4380d'} 100%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 28,
                          fontWeight: "bold",
                          color: "white",
                          boxShadow: `0 4px 15px ${index === 0 ? 'rgba(19, 194, 194, 0.4)' : index === 1 ? 'rgba(82, 196, 26, 0.4)' : 'rgba(250, 140, 22, 0.4)'}`,
                          border: "3px solid rgba(255,255,255,0.3)"
                        }}>
                          #{index + 1}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text 
                            title={product.productName}
                            style={{
                              fontSize: 18,
                              fontWeight: 700,
                              color: "#0D364C",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              lineHeight: "1.4",
                              marginBottom: 6,
                              minHeight: 50,
                              maxHeight: 50
                            }}
                          >
                            {product.productName}
                          </Text>
                          <Text style={{ color: "#13C2C2", fontSize: 14, fontWeight: 500 }}>
                            Đã bán: {product.totalQuantitySold.toLocaleString()} sản phẩm
                          </Text>
                        </div>
                      </div>

                      <div style={{
                        marginTop: 20,
                        paddingTop: 20,
                        borderTop: `2px solid ${index === 0 ? '#13C2C220' : index === 1 ? '#52C41A20' : '#FA8C1620'}`,
                        background: `linear-gradient(135deg, ${index === 0 ? '#13C2C205' : index === 1 ? '#52C41A05' : '#FA8C1605'} 0%, transparent 100%)`,
                        borderRadius: 12,
                        padding: "16px"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <Text style={{
                              color: index === 0 ? "#13C2C2" : index === 1 ? "#52C41A" : "#FA8C16",
                              fontSize: 14,
                              display: "block",
                              fontWeight: 600,
                              marginBottom: 4
                            }}>
                              Doanh thu
                            </Text>
                            <Text style={{
                              fontSize: 20,
                              fontWeight: 700,
                              color: "#0D364C"
                            }}>
                              {product.totalRevenue.toLocaleString()}
                            </Text>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <Text style={{
                              color: index === 0 ? "#13C2C2" : index === 1 ? "#52C41A" : "#FA8C16",
                              fontSize: 14,
                              display: "block",
                              fontWeight: 600,
                              marginBottom: 4
                            }}>
                              Đơn hàng
                            </Text>
                            <Text style={{
                              fontSize: 20,
                              fontWeight: 700,
                              color: "#0D364C"
                            }}>
                              {product.orderCount.toLocaleString()}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
        </>
      )}

      {/* Top Customers Section */}
      {dashboardData?.topCustomers && dashboardData.topCustomers.length > 0 && (
        <>
          <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
            <Col span={24}>
              <Card
                style={{
                  borderRadius: 20,
                  border: `2px solid #722ED1`,
                  boxShadow: "0 8px 32px rgba(114, 46, 209, 0.15)",
                  background: "linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)",
                }}
                bodyStyle={{ padding: "32px", background: "white", margin: "4px", borderRadius: "16px" }}
              >
                <div style={{ marginBottom: 32 }}>
                  <Title level={4} style={{ color: "#0D364C", marginBottom: 8, fontSize: 22, fontWeight: 700 }}>
                    Khách hàng VIP ({dashboardData.topCustomers.length})
                  </Title>
                  <Text style={{ color: "#722ED1", fontSize: 16, fontWeight: 500 }}>
                    Top khách hàng có chi tiêu cao nhất
                  </Text>
                </div>

                <Row gutter={[16, 16]}>
                  {dashboardData.topCustomers.map((customer, index) => (
                    <Col xs={24} sm={12} lg={8} key={customer.userId || index}>
                      <Card
                        style={{
                          borderRadius: 20,
                          border: `2px solid ${index === 0 ? '#722ED1' : index === 1 ? '#EB2F96' : '#FA541C'}`,
                          boxShadow: `0 8px 25px ${index === 0 ? 'rgba(114, 46, 209, 0.15)' : index === 1 ? 'rgba(235, 47, 150, 0.15)' : 'rgba(250, 84, 28, 0.15)'}`,
                          background: `linear-gradient(135deg, ${index === 0 ? '#f9f0ff' : index === 1 ? '#fff0f6' : '#fff2e8'} 0%, ${index === 0 ? '#efdbff' : index === 1 ? '#ffd6e7' : '#ffe7ba'} 100%)`,
                          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                          height: "100%",
                          ":hover": {
                            transform: "translateY(-8px) scale(1.02)",
                            boxShadow: `0 12px 40px ${index === 0 ? 'rgba(114, 46, 209, 0.25)' : index === 1 ? 'rgba(235, 47, 150, 0.25)' : 'rgba(250, 84, 28, 0.25)'}`
                          }
                        }}
                        bodyStyle={{ padding: "24px", background: "white", margin: "3px", borderRadius: "16px", height: "calc(100% - 6px)", display: "flex", flexDirection: "column" }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, minHeight: 90 }}>
                          <div style={{
                            width: 70,
                            height: 70,
                            flexShrink: 0,
                            borderRadius: 20,
                            background: `linear-gradient(135deg, ${index === 0 ? '#722ED1' : index === 1 ? '#EB2F96' : '#FA541C'} 0%, ${index === 0 ? '#531dab' : index === 1 ? '#c41d7f' : '#d4380d'} 100%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 28,
                            fontWeight: "bold",
                            color: "white",
                            boxShadow: `0 4px 15px ${index === 0 ? 'rgba(114, 46, 209, 0.4)' : index === 1 ? 'rgba(235, 47, 150, 0.4)' : 'rgba(250, 84, 28, 0.4)'}`,
                            border: "3px solid rgba(255,255,255,0.3)"
                          }}>
                            #{index + 1}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Text 
                              title={customer.name || customer.customerName}
                              style={{
                                fontSize: 18,
                                fontWeight: 700,
                                color: "#0D364C",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                lineHeight: "1.4",
                                marginBottom: 6,
                                minHeight: 50,
                                maxHeight: 50
                              }}
                            >
                              {customer.name || customer.customerName}
                            </Text>
                            <Text 
                              title={customer.email}
                              style={{ 
                                color: "#722ED1", 
                                fontSize: 13, 
                                fontWeight: 500,
                                display: "block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                              }}
                            >
                              📧 {customer.email}
                            </Text>
                          </div>
                        </div>

                        <div style={{
                          marginTop: 20,
                          paddingTop: 20,
                          borderTop: `2px solid ${index === 0 ? '#722ED120' : index === 1 ? '#EB2F9620' : '#FA541C20'}`,
                          background: `linear-gradient(135deg, ${index === 0 ? '#722ED105' : index === 1 ? '#EB2F9605' : '#FA541C05'} 0%, transparent 100%)`,
                          borderRadius: 12,
                          padding: "16px"
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <Text style={{
                                color: index === 0 ? "#722ED1" : index === 1 ? "#EB2F96" : "#FA541C",
                                fontSize: 14,
                                display: "block",
                                fontWeight: 600,
                                marginBottom: 4
                              }}>
                                Tổng chi tiêu
                              </Text>
                              <Text style={{
                                fontSize: 20,
                                fontWeight: 700,
                                color: "#0D364C"
                              }}>
                                {customer.totalSpent.toLocaleString()}
                              </Text>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <Text style={{
                                color: index === 0 ? "#722ED1" : index === 1 ? "#EB2F96" : "#FA541C",
                                fontSize: 14,
                                display: "block",
                                fontWeight: 600,
                                marginBottom: 4
                              }}>
                                Số đơn hàng
                              </Text>
                              <Text style={{
                                fontSize: 20,
                                fontWeight: 700,
                                color: "#0D364C"
                              }}>
                                {customer.totalOrders.toLocaleString()}
                              </Text>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
          </Row>
        </>
      )}

      {/* Date Picker Modal for New Customers */}
      <Modal
        title="Chọn ngày xem khách hàng mới"
        open={showCustomerDateModal}
        onCancel={() => setShowCustomerDateModal(false)}
        footer={null}
        centered
      >
        <div style={{ padding: "20px 0" }}>
          <DatePicker
            value={selectedCustomerDate ? dayjs(selectedCustomerDate, 'YYYY-MM-DD') : null}
            onChange={handleCustomerDateChange}
            format="DD/MM/YYYY"
            style={{ width: "100%" }}
            size="large"
            disabledDate={(current) => current && current > dayjs().endOf('day')}
            placeholder="Chọn ngày"
          />
          <div style={{ marginTop: 16, color: "#666" }}>
            <Text>Chọn một ngày để xem số lượng khách hàng mới đăng ký trong ngày đó.</Text>
          </div>
        </div>
      </Modal>

      <style>{`
        @keyframes slideInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;


