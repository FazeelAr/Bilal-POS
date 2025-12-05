import React, { useState, useEffect } from "react";
import { apiGet } from "../api/api";
import ReportHeader from "../components/reports/ReportHeader";
import ReportFilters from "../components/reports/ReportFilters";
import DailyReport from "../components/reports/DailyReport";
import MonthlyReport from "../components/reports/MonthlyReport";
import DateRangeReport from "../components/reports/DateRangeReport";
import ReportSummary from "../components/reports/ReportSummary";
import ReportEmptyState from "../components/reports/ReportEmptyState";
import ReportLoading from "../components/reports/ReportLoading";
import ReportError from "../components/reports/ReportError";

export default function Report() {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [filters, setFilters] = useState({
    reportType: "daily",
    selectedCustomer: "",
    dailyDate: new Date().toISOString().split("T")[0],
    monthlyStartDate: "",
    monthlyEndDate: "",
    rangeStartDate: "",
    rangeEndDate: "",
  });

  const [reportData, setReportData] = useState({
    daily: null,
    monthly: [],
    range: null,
  });

  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
    fetchDailyReport();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await apiGet("customers/");
      if (res && res.data) {
        setCustomers(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch customers", err);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    setError(null);

    try {
      if (filters.reportType === "daily") {
        await fetchDailyReport();
      } else if (filters.reportType === "monthly") {
        await fetchMonthlyReport();
      } else if (filters.reportType === "range") {
        await fetchDateRangeReport();
      }
    } catch (err) {
      setError(err.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyReport = async () => {
    const params = new URLSearchParams({
      date: filters.dailyDate,
      ...(filters.selectedCustomer && { customer: filters.selectedCustomer }),
    });

    const res = await apiGet(`orders/reports/daily/?${params}`);
    if (res && res.data) {
      setReportData((prev) => ({ ...prev, daily: res.data }));
      setActiveTab("daily");
    }
  };

  const fetchMonthlyReport = async () => {
    const params = new URLSearchParams({
      ...(filters.monthlyStartDate && { start_date: filters.monthlyStartDate }),
      ...(filters.monthlyEndDate && { end_date: filters.monthlyEndDate }),
      ...(filters.selectedCustomer && { customer: filters.selectedCustomer }),
    });

    const res = await apiGet(`orders/reports/monthly/?${params}`);
    if (res && res.data) {
      setReportData((prev) => ({ ...prev, monthly: res.data }));
      setActiveTab("monthly");
    }
  };

  const fetchDateRangeReport = async () => {
    if (!filters.rangeStartDate || !filters.rangeEndDate) {
      throw new Error("Please select both start and end dates");
    }

    const params = new URLSearchParams({
      start_date: filters.rangeStartDate,
      end_date: filters.rangeEndDate,
      ...(filters.selectedCustomer && { customer: filters.selectedCustomer }),
    });

    const res = await apiGet(`orders/reports/date-range/?${params}`);
    if (res && res.data) {
      setReportData((prev) => ({ ...prev, range: res.data }));
      setActiveTab("range");
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      reportType: "daily",
      selectedCustomer: "",
      dailyDate: new Date().toISOString().split("T")[0],
      monthlyStartDate: "",
      monthlyEndDate: "",
      rangeStartDate: "",
      rangeEndDate: "",
    });
    setReportData({ daily: null, monthly: [], range: null });
    setActiveTab("summary");
    setError(null);
  };

  const hasReportData =
    reportData.daily || reportData.monthly.length > 0 || reportData.range;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <ReportHeader />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ReportFilters
              filters={filters}
              customers={customers}
              onFilterChange={handleFilterChange}
              onGenerate={generateReport}
              onClear={handleClearFilters}
              loading={loading}
            />
          </div>

          {/* Reports Content */}
          <div className="lg:col-span-3">
            {loading && <ReportLoading />}

            {error && (
              <ReportError error={error} onDismiss={() => setError(null)} />
            )}

            {!loading && !error && (
              <>
                {/* Report Type Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  <TabButton
                    active={activeTab === "summary"}
                    onClick={() => setActiveTab("summary")}
                    icon="📊"
                    label="Summary"
                  />
                  {reportData.daily && (
                    <TabButton
                      active={activeTab === "daily"}
                      onClick={() => setActiveTab("daily")}
                      icon="📅"
                      label="Daily Report"
                    />
                  )}
                  {reportData.monthly.length > 0 && (
                    <TabButton
                      active={activeTab === "monthly"}
                      onClick={() => setActiveTab("monthly")}
                      icon="📈"
                      label="Monthly Report"
                    />
                  )}
                  {reportData.range && (
                    <TabButton
                      active={activeTab === "range"}
                      onClick={() => setActiveTab("range")}
                      icon="📋"
                      label="Date Range"
                    />
                  )}
                </div>

                {/* Report Content */}
                <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-4 md:p-6">
                  {activeTab === "summary" && !hasReportData && (
                    <ReportEmptyState />
                  )}

                  {activeTab === "summary" && hasReportData && (
                    <ReportSummary
                      dailyReport={reportData.daily}
                      monthlyReport={reportData.monthly}
                      rangeReport={reportData.range}
                    />
                  )}

                  {activeTab === "daily" && reportData.daily && (
                    <DailyReport report={reportData.daily} />
                  )}

                  {activeTab === "monthly" && reportData.monthly.length > 0 && (
                    <MonthlyReport reports={reportData.monthly} />
                  )}

                  {activeTab === "range" && reportData.range && (
                    <DateRangeReport report={reportData.range} />
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for tabs
function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap ${
        active
          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
          : "bg-white text-gray-700 hover:bg-purple-50 border border-purple-100"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
