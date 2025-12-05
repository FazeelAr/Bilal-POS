import React from "react";
import { BarChart3, TrendingUp } from "lucide-react";

export default function ReportEmptyState() {
  return (
    <div className="py-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="w-10 h-10 text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">
          No Reports Yet
        </h3>
        <p className="text-gray-600 mb-6">
          Generate your first sales report to get started with analytics
        </p>
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-800">How to start:</p>
              <p className="text-xs text-gray-600">
                1. Select report type
                <br />
                2. Apply filters if needed
                <br />
                3. Click "Generate Report"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
