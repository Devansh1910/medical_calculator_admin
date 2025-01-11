import React, { useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import {
  Calculator,
  PlusSquare,
  ClipboardList,
  ChevronLeft,
} from "lucide-react";
import CreateCalculator from "./screen/CreateCalculator";
import ExistingCalculators from "./screen/Existing";

const Dashboard = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const navigationItems = [
    {
      id: "create",
      label: "Create Calculator",
      icon: PlusSquare,
      path: "/create-calculator",
    },
    {
      id: "existing",
      label: "Existing Calculators",
      icon: ClipboardList,
      path: "/existing-calculators",
    },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarCollapsed ? "w-20" : "w-64"
        } bg-blue-600 text-white flex flex-col transition-all duration-300 ease-in-out relative`}
      >
        {/* Toggle button */}
        <button
          onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-6 bg-blue-600 rounded-full p-1 shadow-lg hover:bg-blue-700 transition-colors"
        >
          <ChevronLeft
            className={`w-4 h-4 transition-transform duration-300 ${
              isSidebarCollapsed ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-blue-500">
          <Calculator className="w-8 h-8 flex-shrink-0" />
          {!isSidebarCollapsed && (
            <h1 className="text-xl font-bold truncate">Calculator</h1>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-grow py-4">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset transition-colors ${
                window.location.pathname === item.path
                  ? "bg-blue-700 border-r-4 border-blue-300"
                  : ""
              }`}
              onClick={() => navigate(item.path)}
            >
              <item.icon className="w-6 h-6 flex-shrink-0" />
              {!isSidebarCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-6">
        <div className="h-full bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <Routes>
              <Route path="/create-calculator" element={<CreateCalculator />} />
              <Route
                path="/create-calculator/:id"
                element={<CreateCalculator />}
              />
              <Route
                path="/existing-calculators"
                element={<ExistingCalculators />}
              />
              <Route
                path="/"
                element={<div>Welcome to the Calculator Dashboard!</div>}
              />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return <Dashboard />;
};

export default App;
