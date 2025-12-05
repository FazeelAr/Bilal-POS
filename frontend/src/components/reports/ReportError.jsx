import React from "react";
import { XCircle } from "lucide-react";

export default function ReportError({ error, onDismiss }) {
  return (
    <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 mb-6 border border-red-200">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h4 className="font-semibold text-red-900 mb-1">
              Error Generating Report
            </h4>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-600"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
