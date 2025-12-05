import React from "react";

export default function ReportLoading() {
  return (
    <div className="bg-white rounded-2xl p-12 shadow-lg text-center border border-purple-100">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
      <p className="text-gray-600 font-medium">Generating report...</p>
      <p className="text-gray-400 text-sm mt-2">
        Please wait while we process your data
      </p>
    </div>
  );
}
