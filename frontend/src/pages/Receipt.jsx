import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiPost } from "../api/api";

export default function Receipt() {
  const location = useLocation();
  const navigate = useNavigate();
  const payload = location.state && location.state.payload;
  const [serverResp, setServerResp] = useState(null);

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
          box-sizing: border-box !important; 
          padding: 2mm 6mm 2mm 6mm !important;
          background: white !important;
          color: black !important;
          font-family: 'Arial', 'Helvetica', sans-serif !important;
          font-weight: 700 !important;
          line-height: 1.3 !important;
        }
       
        .print-area .logo-space img {
          max-height: 50px !important;
          max-width: 100% !important;
        }
        .print-area .store-name { 
          font-size: 22px !important; 
          font-weight: 900 !important;
          text-align: center !important;
          margin: 4px 0 !important;
          letter-spacing: 0.5px !important;
          font-family: 'Arial', 'Helvetica', sans-serif !important;
        }
        .print-area .customer-info {
          font-size: 16px !important;
          font-weight: 900 !important;
          text-align: center !important;
          margin: 4px 0 !important;
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
          font-size: 18px !important; 
          font-weight: 900 !important;
          padding: 2px 0 !important;
          font-family: 'Arial', 'Helvetica', sans-serif !important;
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

    // Send to backend
    (async () => {
      try {
        const res = await apiPost("receipt", payload);
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

  const { items = [], total, customer } = payload;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6"
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      <div className="max-w-[400px] mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Screen Preview Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
          <h2
            className="text-2xl font-bold text-white text-center"
            style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
          >
            Receipt Generated
          </h2>
        </div>

        {/* Receipt Preview */}
        <div className="p-6">
          <div
            className="print-area bg-white border-2 border-gray-300 p-4 rounded-lg"
            style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
          >
            {/* Store Name */}
            <h3
              className="store-name text-xl font-bold text-center mb-2 tracking-wide"
              style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
            >
              Bilal Poultry Traders Proprietors Sh M Ahmad 0331-3939373 Sh M
              Bilal 0331-4108643 Sh M Usman 0326-0188883
            </h3>

            <div className="divider border-t-2 border-gray-800 my-3"></div>

            {/* Customer Information */}
            {customer && (
              <>
                <div
                  className="customer-info text-lg font-bold text-center text-gray-900 mb-2"
                  style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
                >
                  Customer: {customer.name}
                </div>
                <div className="divider border-t-2 border-gray-800 my-3"></div>
              </>
            )}

            {/* Date */}
            <div
              className="date-info text-sm text-center text-gray-700 mb-3"
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

            <div className="divider border-t-2 border-gray-800 my-3"></div>

            {/* Customer Info */}
            {payload.customer && (
              <div
                className="text-sm text-center text-gray-700 mb-3"
                style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
              >
                <p className="font-semibold">
                  Customer: {payload.customer.name}
                </p>
              </div>
            )}

            <div className="divider border-t-2 border-gray-800 my-3"></div>
            <table
              className="w-full border-collapse text-sm"
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
                    Qty
                  </th>
                  <th
                    className="text-right border-b-2 border-gray-800 pb-1 font-bold"
                    style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
                  >
                    Price
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
                      <div className="max-w-[120px] break-words">{it.name}</div>
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

            {/* Total Section */}
            <div className="total-section border-t-2 border-gray-800 mt-4 pt-3">
              <div
                className="total-row flex justify-between items-center text-lg font-bold"
                style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
              >
                <span>TOTAL:</span>
                <span>Rs {Number(total || 0).toFixed(2)}</span>
              </div>
              {payload.paid !== undefined && (
                <div
                  className="total-row flex justify-between items-center text-sm mt-2"
                  style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
                >
                  <span>Paid:</span>
                  <span>Rs {Number(payload.paid || 0).toFixed(2)}</span>
                </div>
              )}
              {payload.change !== undefined && (
                <div
                  className="total-row flex justify-between items-center text-sm"
                  style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
                >
                  <span>Change:</span>
                  <span>Rs {Number(payload.change || 0).toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="divider border-t-2 border-gray-800 my-3"></div>

            {/* Footer */}
            <div
              className="footer-text text-sm text-center text-gray-600 mt-4"
              style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
            >
              Thank You For Your Purchase!
            </div>
          </div>

          {/* Server Response */}
          {serverResp && serverResp.id && (
            <div
              className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
              style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
            >
              <p className="text-sm text-green-800">
                <span className="font-semibold">Receipt ID:</span>{" "}
                {serverResp.id}
              </p>
              {customer && (
                <p className="text-sm text-green-800 mt-1">
                  <span className="font-semibold">Customer:</span>{" "}
                  {customer.name}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none font-bold text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
              style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
            >
              🖨 Print Receipt
            </button>
            <button
              onClick={() => navigate("/pos")}
              className="flex-1 py-3 px-4 rounded-xl border-2 border-purple-300 bg-white text-purple-600 font-bold text-base hover:bg-purple-50 transition-all duration-300 cursor-pointer"
              style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
            >
              ✓ Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
