import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import {
  LayoutDashboard,
  Coffee,
  Package,
  Users,
  UserCircle,
  LogOut,
  Menu,
  X,
  ShoppingCart,
  ChevronDown,
  BarChart2,
  KeyRound,
} from "lucide-react";
import ChangePasswordModal from "./ChangePasswordModal";
import "./AppShell.css";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { type: "section", label: "Sell" },
  {
    label: "Sales",
    icon: ShoppingCart,
    children: [
      { to: "/sales/transactions", label: "Orders" },
      { to: "/sales/customers",    label: "Customers" },
    ],
  },
  { type: "section", label: "Products" },
  {
    label: "Menu",
    icon: Coffee,
    children: [
      { to: "/menu",         label: "Items" },
      { to: "/menu/recipes", label: "Recipes" },
    ],
  },
  { to: "/inventory", label: "Inventory", icon: Package },
  { type: "section", label: "Team" },
  {
    label: "Staff",
    icon: Users,
    children: [
      { to: "/team/employees", label: "Employees" },
      { to: "/team/shifts",    label: "Schedule" },
    ],
  },
  { type: "section", label: "Insights", managerOnly: true },
  { to: "/reports", label: "Reports", icon: BarChart2, managerOnly: true },
];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [avatarOpen,    setAvatarOpen]    = useState(false);
  const [showPwModal,   setShowPwModal]   = useState(false);
  const avatarRef = useRef(null);
  const location = useLocation();

  // Close avatar dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    api.get("/products")
      .then(res => {
        const prods = res.data || [];
        // Mirror the same threshold as StockHealthPage: use par_level if set, else fall back to 10
        setLowStockCount(prods.filter(p => {
          const stock = Number(p.stock ?? 0);
          const par   = Number(p.par_level ?? 0);
          return par > 0 ? stock < par : stock < 10;
        }).length);
      })
      .catch(() => {}); // silent fail — badge simply won't appear
  }, []);

  const [openGroups, setOpenGroups] = useState(() => {
    const open = new Set();
    NAV_ITEMS.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some(
          (child) => location.pathname === child.to
        );
        if (hasActiveChild) open.add(item.label);
      }
    });
    return open;
  });

  useEffect(() => {
    NAV_ITEMS.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some(
          (child) => location.pathname === child.to
        );
        if (hasActiveChild) {
          setOpenGroups((prev) => {
            if (prev.has(item.label)) return prev;
            return new Set([...prev, item.label]);
          });
        }
      }
    });
  }, [location.pathname]);

  const toggleGroup = (label) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  return (
    <div className="shell">
      {/* Header */}
      <header className="header">
        <div className="headerLeft">
          <button
            className="menuBtn lg-hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="brand">
            <Coffee size={28} className="brandIcon" />
            <div className="brandText">
              <div className="brandName">Halwa</div>
              <div className="brandSub">Management System</div>
            </div>
          </div>
        </div>
        <div className="headerRight">
          <div className="userInfo">
            <div className="userName">{user?.name || user?.role || "User"}</div>
            <div className="userEmail">{user?.email || ""}</div>
          </div>
          <div className="avatarWrap" ref={avatarRef}>
            <button
              className="avatar"
              onClick={() => setAvatarOpen(o => !o)}
              aria-label="Account menu"
              aria-expanded={avatarOpen}
            >
              <UserCircle size={20} />
            </button>
            {avatarOpen && (
              <div className="avatarMenu">
                <button
                  className="avatarMenuItem"
                  onClick={() => { setShowPwModal(true); setAvatarOpen(false); }}
                >
                  <KeyRound size={13} />
                  Change Password
                </button>
                <div className="avatarMenuDivider" />
                <button className="avatarMenuItem avatarMenuItem--danger" onClick={logout}>
                  <LogOut size={13} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Body: sidebar + main */}
      <div className="body">
        <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : ""}`}>
          <nav className="nav">
            {NAV_ITEMS.filter(item => !item.managerOnly || user?.role === "manager").map((item) => {
              if (item.type === "section") {
                return (
                  <div key={item.label} className="navSection">{item.label}</div>
                );
              }

              if (item.children) {
                const isOpen = openGroups.has(item.label);
                const isGroupActive = item.children.some(
                  (child) => location.pathname === child.to
                );
                const Icon = item.icon;
                return (
                  <div key={item.label} className="navGroup">
                    <button
                      className={`navGroupHeader${isGroupActive ? " groupActive" : ""}`}
                      onClick={() => toggleGroup(item.label)}
                    >
                      <Icon size={16} className="navIcon" />
                      <span className="navLabel">{item.label}</span>
                      <div className="navGroupEnd">
                        {item.label === "Inventory" && lowStockCount > 0 && (
                          <span className="navBadge">{lowStockCount}</span>
                        )}
                        <ChevronDown
                          size={14}
                          className={`chevron${isOpen ? " chevronOpen" : ""}`}
                        />
                      </div>
                    </button>
                    {isOpen && (
                      <div className="navChildren">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            end
                            className={({ isActive }) =>
                              `navSubItem${isActive ? " active" : ""}`
                            }
                            onClick={() => setSidebarOpen(false)}
                          >
                            {child.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    `navItem${isActive ? " active" : ""}`
                  }
                  onClick={() => setSidebarOpen(false)}
                  title={item.label}
                >
                  <Icon size={16} className="navIcon" />
                  <span className="navLabel">{item.label}</span>
                  {item.label === "Inventory" && lowStockCount > 0 && (
                    <span className="navBadge">{lowStockCount}</span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="sidebarFooter">
            <button className="logoutBtn" onClick={logout}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="overlay lg-hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="content">{children}</main>
      </div>

      {showPwModal && (
        <ChangePasswordModal onClose={() => setShowPwModal(false)} />
      )}
    </div>
  );
}
