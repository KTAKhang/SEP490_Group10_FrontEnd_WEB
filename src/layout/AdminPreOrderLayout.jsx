import { Outlet, NavLink, useLocation } from "react-router-dom";

const tabs = [
  { path: "fruits", label: "Pre-order fruit types", icon: "ri-apple-line" },
  { path: "demand", label: "Pre-order demand", icon: "ri-bar-chart-box-line" },
  { path: "import", label: "Receive stock (fulfill)", icon: "ri-archive-line" },
  { path: "orders", label: "Deposit orders", icon: "ri-file-list-3-line" },
];

const AdminPreOrderLayout = () => {
  const location = useLocation();
  const base = "/admin/preorder";

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="border-b border-gray-200">
        <nav className="flex flex-wrap gap-1 -mb-px" aria-label="Pre-order management">
          {tabs.map(({ path, label, icon }) => {
            const to = `${base}/${path}`;
            const isActive = location.pathname === to || (path === "fruits" && location.pathname === base);
            return (
              <NavLink
                key={path}
                to={to}
                end={path === "fruits"}
                className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                <i className={`${icon} text-lg`} />
                {label}
              </NavLink>
            );
          })}
        </nav>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminPreOrderLayout;
