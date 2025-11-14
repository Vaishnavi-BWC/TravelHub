import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaCog, FaFileAlt, FaUserShield } from "react-icons/fa";
import "../styles/quickactions.css"; // Remove "styles from" and use direct import

const QuickActions = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: FaUsers,
      label: "Manage Users",
      path: "/users",
      color: "blue",
    },
    {
      icon: FaCog,
      label: "Configure Policies",
      path: "/policies",
      color: "green",
    },
    {
      icon: FaFileAlt,
      label: "Generate Reports",
      path: "/reports",
      color: "purple",
    },
    {
      icon: FaUserShield,
      label: "Override Approvals",
      path: "/override",
      color: "red",
    },
  ];

  const handleActionClick = (path) => {
    console.log("Navigating to:", path);
    navigate(path);
  };

  return (
    <div className="maincardquickactions">
      <div className="cardHeaderquickactions">
        <h3>Quick Actions</h3>
      </div>
      <div className="quickActions cardBody">
        <div className="quickActionGrid">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <button
                key={index}
                onClick={() => handleActionClick(action.path)}
                className="quickActionBtn" // Remove styles.
              >
                <div className={`quickActionIcon ${action.color}`}>
                  {" "}
                  {/* Remove styles. */}
                  <IconComponent className="quickActionSvg" />{" "}
                  {/* Remove styles. */}
                </div>
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
