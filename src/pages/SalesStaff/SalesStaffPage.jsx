/**
 * author: KHoanDCE170420
 * SalesStaffPage.jsx
 * Dashboard page for Sales Staff
 * this page provides quick acess for sales staff to key functionalities
 */
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Ticket,
} from "lucide-react";
import { Link } from "react-router-dom";

// Simple Card components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-6 pb-4 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={className}>{children}</h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const SalesStaffPage = () => {
  // Mock data will replace when connected to backend
  const stats = [
    {
      title: "Total Discount Codes",
      value: "45",
      change: "+5.2%",
      trend: "up",
      icon: Ticket,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Discount Codes Pending Approval",
      value: "12",
      change: "+2.1%",
      trend: "up",
      icon: Package,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Approved Discount Codes",
      value: "28",
      change: "+8.5%",
      trend: "up",
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Rejected Discount Codes",
      value: "5",
      change: "-1.2%",
      trend: "down",
      icon: DollarSign,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back to the Sales Staff portal!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
          return (
            <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">
                  {stat.value}
                </div>
                <div
                  className={`flex items-center space-x-1 text-xs mt-2 ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  <TrendIcon size={14} />
                  <span>{stat.change}</span>
                  <span className="text-gray-500">compared to last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Discount Codes */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Recent Discount Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      Discount Code #{1000 + item}
                    </p>
                    <p className="text-sm text-gray-500">SUMMER{item}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">10% OFF</p>
                    <p className="text-xs text-yellow-600">Pending Approval</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/sale-staff/discounts"
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors"
              >
                <Ticket className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">Manage Discount Codes</p>
              </Link>
              <Link
                to="/sale-staff/discounts"
                className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors"
              >
                <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">Create New Code</p>
              </Link>
              <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors">
                <ShoppingCart className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">View Reports</p>
              </button>
              <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors">
                <DollarSign className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-800">Statistics</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesStaffPage;
