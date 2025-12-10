import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiPost } from "../api/api";

export default function Receipt() {
  const location = useLocation();
  const navigate = useNavigate();
  const payload = location.state && location.state.payload;
  const backendResponse = location.state && location.state.response; // Get backend response
  const [serverResp, setServerResp] = useState(null);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    if (!payload) {
      navigate("/pos");
      return;
    }

    // Thermal printer optimized stylesheet
    const style = document.createElement("style");
    style.id = "receipt-print-style";
    style.innerHTML = `
      @media print {
        @page { 
          size: 88mm auto; 
          margin: 0; 
        }
        body { 
          margin: 0 !important; 
          padding: 0 !important; 
          background: white;
          font-family: 'Arial', 'Helvetica', sans-serif !important;
        }
        body * { 
          visibility: hidden !important; 
        }
        .print-area, .print-area * { 
          visibility: visible !important; 
        }
        .print-area { 
          position: absolute !important; 
          left: 0 !important; 
          top: 0 !important; 
          width: 88mm !important; 
          box-sizing border-box !important; 
          padding: 2mm 6mm 2mm 6mm !important;
          background: white !important;
          color: black !important;
          font-family: 'Arial', 'Helvetica', sans-serif !important;
          font-weight: 700 !important;
          line-height: 1.3 !important;
        }
       
        .print-area .logo-space {
          text-align: center !important;
          margin: 0 auto 4px auto !important;
        }
        .print-area .logo-space img {
          max-height: 50px !important;
          max-width: 100% !important;
          height: auto !important;
        }
        .print-area .store-name { 
          font-size: 22px !important; 
          font-weight: 900 !important;
          text-align: center !important;
          margin: 4px 0 !important;
          letter-spacing: 0.5px !important;
          font-family: 'Arial', 'Helvetica', sans-serif !important;
        }
        .print-area .store-info {
          font-size: 12px !important;
          font-weight: 700 !important;
          text-align: center !important;
          margin: 2px 0 !important;
          font-family: 'Arial', 'Helvetica', sans-serif !important;
        }
        .print-area .customer-info {
          font-size: 16px !important;
          font-weight: 900 !important;
          text-align: center !important;
          margin: 4px 0 !important;
          font-family: 'Arial', 'Helvetica', sans-serif !important;
        }
        .print-area .sale-id {
          font-size: 12px !important;
          font-weight: 700 !important;
          text-align: center !important;
          margin: 2px 0 !important;
          font-family: 'Arial', 'Helvetica', sans-serif !important;
        }
        .print-area .date-info { 
          font-size: 14px !important; 
          text-align: center !important;
          margin: 6px 0 !important; 
          font-weight: 700 !important;
          font-family: 'Arial', 'Helvetica', sans-serif !important;
        }
        .print-area .divider {
          border-top: 1px solid #000 !important;
          margin: 6px 0 !important;
          height: 0 !important;
        }
        .print-area table { 
          width: 100% !important; 
          border-collapse: collapse !important; 
          margin: 6px 0 !important; 
          font-size: 14px !important;
          font-weight: 700 !important;
          font-family: 'Arial', 'Helvetica', sans-serif !important;
        }
        .print-area th { 
          font-size: 14px !important; 
          font-weight: 900 !important;
          padding: 4px 2px !important; 
          border-bottom: 1px solid #000 !important;
          text-align: left !important;
          font-family: 'Arial', 'Helvetica', sans-serif !important;
        }
        .print-area th.text-center { text-align: center !important; }
        .print-area th.text-right { text-align: right !important; }
        .print-area td { 
          font-size: 14px !important; 
          font-weight: 700 !important;
          padding: 3px 2px !important; 
          border-bottom: none !important;
          vertical-align: top !important;
          font-family: 'Arial', 'Helvetica', sans-serif !important;
        }
        .print-area td.text-center { text-align: center !important; }
        .print-area td.text-right { text-align: right !important; }
        .print-area .item-name {
          max-width: 120px !important;
          word-wrap: break-word !important;
        }
        .print-area .total-section { 
          margin-top: 8px !important; 
          border-top: 2px solid #000 !important; 
          padding-top: 6px !important; 
        }
        .print-area .total-row { 
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          font-size: 16px !important; 
          font-weight: 900 !important;
          padding: 2px 0 !important;
          font-family: 'Arial', 'Helvetica', sans-serif !important;
        }
        .print-area .payment-row {
          font-size: 14px !important;
          font-weight: 700 !important;
          padding: 1px 0 !important;
        }
        .print-area .balance-row {
          font-size: 15px !important;
          font-weight: 900 !important;
          padding: 3px 0 !important;
          border-top: 1px dashed #000 !important;
          margin-top: 3px !important;
        }
        .print-area .total-balance-row {
          font-size: 16px !important;
          font-weight: 900 !important;
          padding: 3px 0 !important;
          border-top: 2px solid #000 !important;
          margin-top: 4px !important;
          padding-top: 4px !important;
        }
        .print-area .footer-text {
          text-align: center !important;
          font-size: 14px !important;
          margin-top: 10px !important;
          font-weight: 700 !important;
          font-family: 'Arial', 'Helvetica', sans-serif !important;
        }
        .print-area tr { 
          page-break-inside: avoid !important; 
        }
        .print-area thead { 
          display: table-header-group !important; 
        }
      }
    `;
    document.head.appendChild(style);

    // Send to backend receipt endpoint
    (async () => {
      try {
        const receiptData = {
          items: payload.items,
          total: payload.total,
          createdAt: payload.createdAt,
          customer: payload.customer,
          ...(payload.payment_amount && { paid: payload.payment_amount }),
          ...(payload.balance_due !== undefined && {
            change: payload.balance_due,
          }),
        };

        const res = await apiPost("sales/receipt/", receiptData);
        setServerResp(res && res.data ? res.data : null);
      } catch (err) {
        console.warn("Receipt POST failed", err);
      }
    })();

    // Auto-print with delay
    const t = setTimeout(() => {
      try {
        window.print();
      } catch (e) {
        console.log(e);
      }
    }, 400);

    return () => {
      clearTimeout(t);
      const s = document.getElementById("receipt-print-style");
      if (s && s.parentNode) s.parentNode.removeChild(s);
    };
  }, [payload, navigate]);

  if (!payload) return null;

  const {
    items = [],
    total,
    customer,
    payment_amount,
    payment_status,
    balance_due,
  } = payload;

  // Determine if it's a partial or full payment
  const isFullPayment = payment_status === "paid";
  const isPartialPayment = payment_status === "partial";
  const isUnpaid = payment_status === "unpaid";
  const hasPaymentInfo = payment_amount !== undefined;

  // Get customer name and previous balance
  const customerName =
    customer && typeof customer === "object" ? customer.name : customer;

  // Customer's previous balance (before this transaction)
  const previousBalance =
    customer && typeof customer === "object"
      ? customer.starting_balance || customer.balance || 0
      : 0;

  const handleLogoError = () => {
    setLogoError(true);
  };

  // Calculate updated balance
  const currentBillAmount = total || 0;
  const paymentMade = payment_amount || 0;

  // Updated Balance = Previous Balance + Current Bill - Payment Made
  const updatedBalance = previousBalance + currentBillAmount - paymentMade;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-6"
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      <div className="max-w-[420px] mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Screen Preview Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
          <h2
            className="text-2xl font-bold text-white text-center"
            style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
          >
            {isFullPayment
              ? "Payment Complete!"
              : isPartialPayment
              ? "Partial Payment"
              : isUnpaid
              ? "Order Created"
              : "Receipt Generated"}
          </h2>
        </div>

        {/* Receipt Preview */}
        <div className="p-4 md:p-6">
          <div
            className="print-area bg-white border-2 border-gray-300 p-3 md:p-4 rounded-lg"
            style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
          >
            {/* Logo */}
            <div className="logo-space mb-3">
              {!logoError ? (
                <img
                  src="/images/logo.png"
                  alt="Bilal Poultry Traders"
                  className="h-12 mx-auto"
                  onError={handleLogoError}
                />
              ) : (
                <div className="text-center">
                  <div className="text-3xl mb-1">🐔</div>
                  <div className="text-xs text-gray-500">Logo</div>
                </div>
              )}
            </div>

            {/* Store Name */}
            <h3
              className="store-name text-lg md:text-xl font-bold text-center mb-1 md:mb-2 tracking-wide"
              style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
            >
              Bilal Poultry Traders
            </h3>

            {/* Store Contact Info */}
            <div className="store-info space-y-0.5 mb-2">
              <div className="text-xs text-gray-700 text-center">
                Prop. Sh M Ahmad 0331-3939373
              </div>
              <div className="text-xs text-gray-700 text-center">
                Sh.M Bilal 03314108643
              </div>
              <div className="text-xs text-gray-700 text-center">
                Sh.M Usman 03260188883
              </div>
            </div>

            <div className="divider border-t-2 border-gray-800 my-2 md:my-3"></div>

            {/* Customer Information + Sale ID */}
            {customer && (
              <>
                <div
                  className="customer-info text-base md:text-lg font-bold text-center text-gray-900 mb-1"
                  style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
                >
                  {customerName}
                </div>
                <div className="sale-id text-xs text-center text-gray-700 mb-1">
                  <span className="font-semibold">Invoice #:</span>{" "}
                  {backendResponse?.id ||
                    serverResp?.id ||
                    payload.saleId ||
                    "N/A"}
                </div>
                <div className="divider border-t-2 border-gray-800 my-2 md:my-3"></div>
              </>
            )}

            {/* Date */}
            <div
              className="date-info text-sm text-center text-gray-700 mb-2 md:mb-3"
              style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
            >
              {new Date(payload.createdAt).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>

            <div className="divider border-t-2 border-gray-800 my-2 md:my-3"></div>

            {/* Items Table */}
            <table
              className="w-full border-collapse text-xs md:text-sm"
              style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
            >
              <thead>
                <tr>
                  <th
                    className="text-left border-b-2 border-gray-800 pb-1 font-bold"
                    style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
                  >
                    Item
                  </th>
                  <th
                    className="text-center border-b-2 border-gray-800 pb-1 font-bold"
                    style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
                  >
                    Kg
                  </th>
                  <th
                    className="text-right border-b-2 border-gray-800 pb-1 font-bold"
                    style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
                  >
                    Rate
                  </th>
                  <th
                    className="text-right border-b-2 border-gray-800 pb-1 font-bold"
                    style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={it.productId || idx}>
                    <td
                      className="py-1.5 align-top"
                      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
                    >
                      <div className="max-w-[100px] break-words">{it.name}</div>
                    </td>
                    <td
                      className="py-1.5 text-center align-top"
                      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
                    >
                      {it.qty}
                    </td>
                    <td
                      className="py-1.5 text-right align-top"
                      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
                    >
                      {Number((it.price || 0) * (it.factor || 1)).toFixed(2)}
                    </td>
                    <td
                      className="py-1.5 text-right align-top font-semibold"
                      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
                    >
                      {Number(it.lineTotal).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total and Payment Section */}
            <div className="total-section border-t-2 border-gray-800 mt-3 md:mt-4 pt-2 md:pt-3">
              {/* Current Bill Total */}
              <div
                className="total-row flex justify-between items-center text-base md:text-lg font-bold"
                style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
              >
                <span>CURRENT BILL:</span>
                <span>Rs {Number(currentBillAmount || 0).toFixed(2)}</span>
              </div>

              {/* Previous Balance */}
              {previousBalance !== 0 && (
                <div
                  className="payment-row flex justify-between items-center text-sm md:text-base mt-1"
                  style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
                >
                  <span>PREVIOUS BALANCE:</span>
                  <span>Rs {Number(previousBalance || 0).toFixed(2)}</span>
                </div>
              )}

              {/* Payment Information */}
              {hasPaymentInfo && (
                <>
                  <div
                    className="payment-row flex justify-between items-center text-sm md:text-base mt-1"
                    style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
                  >
                    <span>PAID TODAY:</span>
                    <span>Rs {Number(paymentMade || 0).toFixed(2)}</span>
                  </div>

                  {/* Current Order Balance Due (if partial payment) */}
                  {balance_due > 0 && (
                    <div
                      className="balance-row flex justify-between items-center text-yellow-700 mt-1"
                      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
                    >
                      <span>THIS BILL BALANCE:</span>
                      <span>Rs {balance_due.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}

              {/* UPDATED TOTAL BALANCE */}
              <div
                className="total-balance-row flex justify-between items-center mt-2"
                style={{
                  fontFamily: "Arial, Helvetica, sans-serif",
                  color:
                    updatedBalance > 0
                      ? "#dc2626"
                      : updatedBalance < 0
                      ? "#16a34a"
                      : "#000000",
                  borderTop: "2px solid #000",
                  paddingTop: "4px",
                  marginTop: "4px",
                }}
              >
                <span className="font-bold">UPDATED BALANCE:</span>
                <span className="font-bold">
                  Rs {Math.abs(updatedBalance).toFixed(2)}
                  {updatedBalance > 0 && " (Amount Due)"}
                  {updatedBalance < 0 && " (Credit)"}
                  {updatedBalance === 0 && " (Settled)"}
                </span>
              </div>
            </div>

            <div className="divider border-t-2 border-gray-800 my-2 md:my-3"></div>

            {/* Footer Message */}
            <div
              className="footer-text text-sm text-center text-gray-600 mt-3 md:mt-4"
              style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
            >
              Thank You For Your Business!
            </div>
            <div className="text-xs text-center text-gray-500 mt-1">
              Please keep this receipt for your records
            </div>
          </div>

          {/* Success Message */}
          <div className="mt-4 md:mt-6 space-y-3">
            <div
              className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg"
              style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
            >
              <p className="text-sm text-purple-800">
                <span className="font-semibold">Status:</span>{" "}
                {isFullPayment
                  ? "Fully Paid"
                  : isPartialPayment
                  ? "Partial Payment"
                  : isUnpaid
                  ? "Order Created (Unpaid)"
                  : "Transaction Complete"}
              </p>

              {backendResponse?.id && (
                <p className="text-sm text-purple-800 mt-1">
                  <span className="font-semibold">Order ID:</span>{" "}
                  {backendResponse.id}
                </p>
              )}

              {customer && (
                <p className="text-sm text-purple-800 mt-1">
                  <span className="font-semibold">Customer:</span>{" "}
                  {customerName}
                </p>
              )}

              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Previous Balance:</span> Rs{" "}
                  {previousBalance.toFixed(2)}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Current Bill:</span> + Rs{" "}
                  {currentBillAmount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Payment Made:</span> - Rs{" "}
                  {paymentMade.toFixed(2)}
                </p>
                <div className="border-t border-gray-300 pt-1 mt-1">
                  <p
                    className={`text-sm font-bold ${
                      updatedBalance > 0
                        ? "text-red-800"
                        : updatedBalance < 0
                        ? "text-green-800"
                        : "text-purple-800"
                    }`}
                  >
                    <span className="font-semibold">Updated Balance:</span> Rs{" "}
                    {Math.abs(updatedBalance).toFixed(2)}
                    {updatedBalance > 0 && " (Amount Due)"}
                    {updatedBalance < 0 && " (Credit Balance)"}
                    {updatedBalance === 0 && " (Fully Settled)"}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none font-bold text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
              >
                🖨 Print Receipt
              </button>
              <button
                onClick={() => navigate("/pos")}
                className="flex-1 py-3 px-4 rounded-xl border-2 border-purple-300 bg-white text-purple-600 font-bold text-base hover:bg-purple-50 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
              >
                ✓ New Sale
              </button>
            </div>

            {/* Additional Options */}
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => navigate("/report")}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                View Reports
              </button>
              <span className="text-gray-400">•</span>
              <button
                onClick={() => navigate("/pos")}
                className="text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                Back to POS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
