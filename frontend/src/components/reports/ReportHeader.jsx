import React from "react";
import { BarChart3 } from "lucide-react";

export default function ReportHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Sales Analytics
        </h1>
      </div>
      <p className="text-gray-600 ml-14">
        Generate detailed sales reports and analytics
      </p>
    </div>
  );
}
