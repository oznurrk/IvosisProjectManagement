// src/components/ui/Card.jsx
import React from "react";

export const Card = ({ children }) => {
  return (
    <div className="bg-white shadow rounded-xl overflow-hidden">
      {children}
    </div>
  );
};

export const CardContent = ({ children, className = "" }) => {
  return <div className={`p-4 ${className}`}>{children}</div>;
};
