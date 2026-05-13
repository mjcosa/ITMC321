(function () {
  const apiBase = "/api";

  function escapeHtml(value) {
    if (value === undefined || value === null) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  const resultEl = document.getElementById("result");
  const salesGraphContainer = document.getElementById("salesGraphContainer");
  let salesChart = null;

  let currentDataArray = [];
  let currentHeaders = [];
  let currentPage = 1;
  const pageSize = 10;
  let currentView = "default";

  function hideForecastHistory() {
  const el = document.getElementById("forecastSalesHistory");
  if (el) el.style.display = "none";
}

  const paginationControls = document.getElementById("pagination-controls");
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");
  const pageInfo = document.getElementById("pageInfo");

  if (btnPrev && btnNext) {
    btnPrev.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        if (currentView === "orders") renderOrdersTable();
        else if (currentView === "forecast") renderForecastTable();
        else if (currentView === "payments") renderPaymentsTable();
        else renderTable();
      }
    });
    btnNext.addEventListener("click", () => {
      const totalPages = Math.ceil(currentDataArray.length / pageSize);
      if (currentPage < totalPages) {
        currentPage++;
        if (currentView === "orders") renderOrdersTable();
        else if (currentView === "forecast") renderForecastTable();
        else if (currentView === "payments") renderPaymentsTable();
        else renderTable();
      }
    });
  }

  function show(obj) {
    currentView = "default";
    hideSalesGraph();
    if (salesChart) {
      salesChart.destroy();
      salesChart = null;
    }
    
    resultEl.innerHTML = "";
    if (paginationControls) paginationControls.style.display = "none";

    if (!obj || (Array.isArray(obj) && obj.length === 0)) {
      resultEl.innerHTML = '<div class="empty-state">No data available.</div>';
      return;
    }

    // Normalize to array (handles objects containing an array like { data: [...] })
    let dataArray = Array.isArray(obj) ? obj : [obj];
    if (!Array.isArray(obj) && typeof obj === "object" && obj !== null) {
      if (Array.isArray(obj.data)) {
        dataArray = obj.data;
      } else {
        const keys = Object.keys(obj);
        if (keys.length === 1 && Array.isArray(obj[keys[0]])) {
          dataArray = obj[keys[0]];
        }
      }
    }

    if (dataArray.length === 0) {
      resultEl.innerHTML = '<div class="empty-state">No data available.</div>';
      return;
    }

    // General function to flatten all nested objects and arrays
    function flattenObject(ob, prefix = "") {
      let result = {};
      if (typeof ob !== "object" || ob === null) return ob;
      for (const i in ob) {
        if (ob.hasOwnProperty(i)) {
          const newKey = prefix ? prefix + "_" + i : i;
          if (
            typeof ob[i] === "object" &&
            ob[i] !== null &&
            !Array.isArray(ob[i])
          ) {
            Object.assign(result, flattenObject(ob[i], newKey));
          } else if (Array.isArray(ob[i])) {
            if (ob[i].length === 0) {
              result[newKey] = "[]";
            } else {
              ob[i].forEach((item, index) => {
                const arrKey = newKey + "_" + (index + 1);
                if (typeof item === "object" && item !== null) {
                  Object.assign(result, flattenObject(item, arrKey));
                } else {
                  result[arrKey] = item;
                }
              });
            }
          } else {
            result[newKey] = ob[i];
          }
        }
      }
      return result;
    }

    // Flatten all items
    currentDataArray = dataArray.map((item) => flattenObject(item));

    // Extract headers
    const allKeys = new Set();
    currentDataArray.forEach((item) => {
      if (typeof item === "object" && item !== null) {
        Object.keys(item).forEach((key) => allKeys.add(key));
      }
    });
    currentHeaders = Array.from(allKeys).filter(key => {
      const k = key.toLowerCase();
      return !k.includes('daily') && 
             !k.includes('weekly') && 
             !k.includes('monthly') && 
             !k.includes('sales_history') && 
             !k.includes('saleshistory') &&
             k !== '_id' && 
             k !== 'id' && 
             k !== '__v' && 
             k !== 'v';
    });

    // Handle non-object arrays
    if (currentHeaders.length === 0) {
      currentHeaders.push("Value");
      currentDataArray = currentDataArray.map((val) => ({ Value: val }));
    }

    currentPage = 1;
    renderTable();
  }

  function renderTable() {
    resultEl.innerHTML = "";

    if (currentDataArray.length === 0) return;

    const totalPages = Math.ceil(currentDataArray.length / pageSize);
    if (paginationControls) {
      if (totalPages > 1) {
        paginationControls.style.display = "flex";
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        btnPrev.disabled = currentPage === 1;
        btnNext.disabled = currentPage === totalPages;
      } else {
        paginationControls.style.display = "none";
      }
    }

    const table = document.createElement("table");
    table.className = "data-table";

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    currentHeaders.forEach((key) => {
      const th = document.createElement("th");
      // Convert camelCase and snake_case to Space Separated words
      let spaceSeparated = key
        .replace(/_/g, " ")
        .replace(/([A-Z])/g, " $1")
        .trim();
      // Capitalize each word
      th.textContent = spaceSeparated
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ");
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, currentDataArray.length);
    const paginatedData = currentDataArray.slice(startIndex, endIndex);

    paginatedData.forEach((item) => {
      const tr = document.createElement("tr");
      currentHeaders.forEach((key) => {
        const td = document.createElement("td");
        const val = item[key];
        if (typeof val === "object" && val !== null) {
          td.textContent = JSON.stringify(val);
        } else {
          td.textContent =
            val !== undefined && val !== null ? String(val) : "-";
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    resultEl.appendChild(table);
  }

  function parseForecastDataArray(obj) {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    if (typeof obj === "object" && Array.isArray(obj.data)) return obj.data;
    if (typeof obj === "object" && obj !== null) {
      const keys = Object.keys(obj);
      if (keys.length === 1 && Array.isArray(obj[keys[0]])) return obj[keys[0]];
    }
    return [];
  }

  function forecastProductId(row) {
    if (!row || typeof row !== "object") return "-";
    return row.productId ?? row.product_id ?? "-";
  }

  function forecastProductName(row) {
    if (!row || typeof row !== "object") return "-";
    return row.productName ?? row.product_name ?? "-";
  }

  function forecastTargetPeriod(row) {
    if (!row || typeof row !== "object") return "Next 30 Days";
    return row.targetPeriod ?? row.target_period ?? "Next 30 Days";
  }

  function forecastPredictedDemand(row) {
    if (!row || typeof row !== "object") return undefined;
    const v =
      row.predictedDemand ??
      row.forecast_predicted_demand_next_30_days;
    return v;
  }

  function forecastSuggestedRestock(row) {
    if (!row || typeof row !== "object") return undefined;
    return (
      row.suggestedRestockQty ??
      row.forecast_suggested_restock_qty ??
      row.suggested_restock_qty
    );
  }

  function forecastStockoutRisk(row) {
    if (!row || typeof row !== "object") return "-";
    return row.stockoutRisk ?? row.analytics_stockout_risk ?? "-";
  }

  function formatForecastMetric(value) {
    if (value === undefined || value === null || value === "") return "-";
    const n = Number(value);
    if (!Number.isNaN(n)) return Number.isInteger(n) ? String(n) : n.toFixed(2);
    return String(value);
  }

  function showForecast(obj) {
    currentView = "forecast";
    hideSalesGraph();
    if (salesChart) {
      salesChart.destroy();
      salesChart = null;
    }

    resultEl.innerHTML = "";
    if (paginationControls) paginationControls.style.display = "none";

    const dataArray = parseForecastDataArray(obj);
    if (dataArray.length === 0) {
      resultEl.innerHTML =
        '<div class="empty-state">No forecast data available.</div>';
      currentDataArray = [];
      return;
    }

    currentDataArray = dataArray.filter(
      (item) => item && typeof item === "object",
    );
    currentPage = 1;
    renderForecastTable();
  }

  function renderForecastTable() {
    resultEl.innerHTML = "";

    if (currentDataArray.length === 0) return;

    const totalPages = Math.ceil(currentDataArray.length / pageSize);
    if (paginationControls) {
      if (totalPages > 1) {
        paginationControls.style.display = "flex";
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        btnPrev.disabled = currentPage === 1;
        btnNext.disabled = currentPage === totalPages;
      } else {
        paginationControls.style.display = "none";
      }
    }

    const table = document.createElement("table");
    table.className = "data-table";

    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>Product Id</th>
        <th>Product Name</th>
        <th>Target Period</th>
        <th>Stockout Risk</th>
        <th>Action</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(
      startIndex + pageSize,
      currentDataArray.length,
    );
    const pageRows = currentDataArray.slice(startIndex, endIndex);

    pageRows.forEach((row) => {
      const tr = document.createElement("tr");
      const pid = forecastProductId(row);
      const pname = forecastProductName(row);
      const period = forecastTargetPeriod(row);
      const risk = forecastStockoutRisk(row);

      tr.innerHTML = `
        <td>${escapeHtml(pid)}</td>
        <td>${escapeHtml(pname)}</td>
        <td>${escapeHtml(period)}</td>
        <td>${escapeHtml(risk)}</td>
        <td><button type="button" class="view-forecast-btn">View details</button></td>
      `;

      const detailBtn = tr.querySelector(".view-forecast-btn");
      if (detailBtn) {
        detailBtn.addEventListener("click", () => openForecastDetailModal(row));
      }
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    resultEl.appendChild(table);
  }

  function openForecastDetailModal(row) {
    const modal = document.getElementById("forecastDetailModal");
    const body = document.getElementById("forecastDetailContent");
    const title = document.getElementById("forecastDetailTitle");
    if (!modal || !body) {
      console.error("Forecast detail modal markup is missing.");
      return;
    }

    const pid = forecastProductId(row);
    if (title) {
      title.textContent = `Forecast details — ${pid}`;
    }

    const recommendation =
      row.forecast_recommendation ??
      row.forecastRecommendation ??
      null;
    const suggestedPriceRaw =
      row.pricing_suggested_price ??
      row.suggestedPrice ??
      row.pricingSuggestedPrice ??
      null;
    const pricingReason =
      row.pricing_reason ??
      row.pricingReason ??
      row.strategyReason ??
      null;
    let historicalSalesRaw =
      row.analytics_total_historical_sales ??
      row.totalHistoricalSales ??
      null;
    if (
      (historicalSalesRaw === null ||
        historicalSalesRaw === undefined ||
        historicalSalesRaw === "") &&
      row.salesHistory &&
      typeof row.salesHistory === "object"
    ) {
      const daily = row.salesHistory.daily;
      if (daily && typeof daily === "object") {
        let sum = 0;
        const vals =
          typeof daily.values === "function"
            ? Array.from(daily.values())
            : Object.values(daily);
        vals.forEach((v) => {
          sum += Number(v) || 0;
        });
        if (sum > 0 || Object.keys(daily).length > 0) {
          historicalSalesRaw = sum;
        }
      }
    }

    const recommendationDisplay =
      recommendation !== null && recommendation !== undefined && recommendation !== ""
        ? escapeHtml(recommendation)
        : "—";

    let suggestedPriceDisplay = "—";
    if (suggestedPriceRaw !== null && suggestedPriceRaw !== undefined && suggestedPriceRaw !== "") {
      const n = Number(suggestedPriceRaw);
      suggestedPriceDisplay = Number.isFinite(n)
        ? escapeHtml(`$${n.toFixed(2)}`)
        : escapeHtml(String(suggestedPriceRaw));
    }

    const pricingReasonDisplay =
      pricingReason !== null && pricingReason !== undefined && pricingReason !== ""
        ? escapeHtml(pricingReason)
        : "—";

    let historicalSalesDisplay = "—";
    if (
      historicalSalesRaw !== null &&
      historicalSalesRaw !== undefined &&
      historicalSalesRaw !== ""
    ) {
      const n = Number(historicalSalesRaw);
      historicalSalesDisplay = Number.isFinite(n)
        ? escapeHtml(String(n))
        : escapeHtml(String(historicalSalesRaw));
    }

    const predictedDemandDisplay = escapeHtml(
      formatForecastMetric(forecastPredictedDemand(row)),
    );
    const suggestedRestockDisplay = escapeHtml(
      formatForecastMetric(forecastSuggestedRestock(row)),
    );

    body.innerHTML = `
      <div class="forecast-detail-field">
        <span class="forecast-detail-label">Predicted demand</span>
        <span class="forecast-detail-value">${predictedDemandDisplay}</span>
      </div>
      <div class="forecast-detail-field">
        <span class="forecast-detail-label">Suggested restock qty</span>
        <span class="forecast-detail-value">${suggestedRestockDisplay}</span>
      </div>
      <div class="forecast-detail-field">
        <span class="forecast-detail-label">Forecast recommendation</span>
        <span class="forecast-detail-value">${recommendationDisplay}</span>
      </div>
      <div class="forecast-detail-field">
        <span class="forecast-detail-label">Suggested price</span>
        <span class="forecast-detail-value">${suggestedPriceDisplay}</span>
      </div>
      <div class="forecast-detail-field">
        <span class="forecast-detail-label">Pricing reason</span>
        <span class="forecast-detail-value">${pricingReasonDisplay}</span>
      </div>
      <div class="forecast-detail-field">
        <span class="forecast-detail-label">Total historical sales</span>
        <span class="forecast-detail-value">${historicalSalesDisplay}</span>
      </div>
    `;

    modal.style.display = "block";
  }

  function parsePaymentsDataArray(obj) {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    if (typeof obj === "object" && Array.isArray(obj.data)) return obj.data;
    if (typeof obj === "object" && obj !== null) {
      const keys = Object.keys(obj);
      if (keys.length === 1 && Array.isArray(obj[keys[0]])) return obj[keys[0]];
    }
    return [];
  }

  function paymentTransactionRef(row) {
    if (!row || typeof row !== "object") return "-";
    const v =
      row.transaction_reference ??
      row.transactionReference ??
      row.reference ??
      row.reference_id ??
      null;
    if (v !== null && v !== undefined && String(v) !== "") return String(v);
    if (row._id !== undefined && row._id !== null) return String(row._id);
    if (row.id !== undefined && row.id !== null) return String(row.id);
    return "-";
  }

  function paymentPaymentDateValue(row) {
    if (!row || typeof row !== "object") return null;
    return row.payment_date ?? row.paymentDate ?? null;
  }

  function paymentCreatedAtValue(row) {
    if (!row || typeof row !== "object") return null;
    return row.createdAt ?? row.created_at ?? null;
  }

  function paymentUpdatedAtValue(row) {
    if (!row || typeof row !== "object") return null;
    return row.updatedAt ?? row.updated_at ?? null;
  }

  function formatPaymentDateTime(value) {
    if (value === null || value === undefined || value === "") return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return escapeHtml(String(value));
    return escapeHtml(d.toLocaleString());
  }

  function paymentAmountDisplay(row) {
    const raw =
      row.payment_amount ??
      row.amount ??
      row.total ??
      row.total_amount ??
      null;
    if (raw === null || raw === undefined || raw === "") return "—";
    const n = Number(raw);
    if (!Number.isFinite(n)) return escapeHtml(String(raw));
    return escapeHtml(`$${n.toFixed(2)}`);
  }

  function paymentStatusDisplay(row) {
    const s = row.payment_status ?? row.status ?? null;
    if (s === null || s === undefined || s === "") return "—";
    return escapeHtml(String(s));
  }

  function paymentMethodDisplay(row) {
    const m =
      row.payment_method ??
      row.paymentMethod ??
      row.method ??
      row.payment_type ??
      row.paymentType ??
      null;
    if (m === null || m === undefined || m === "") return "—";
    return escapeHtml(String(m));
  }

  function showPayments(obj) {
    currentView = "payments";
    hideSalesGraph();
    if (salesChart) {
      salesChart.destroy();
      salesChart = null;
    }

    resultEl.innerHTML = "";
    if (paginationControls) paginationControls.style.display = "none";

    const dataArray = parsePaymentsDataArray(obj);
    if (dataArray.length === 0) {
      resultEl.innerHTML =
        '<div class="empty-state">No payment data available.</div>';
      currentDataArray = [];
      return;
    }

    currentDataArray = dataArray.filter(
      (item) => item && typeof item === "object",
    );
    currentPage = 1;
    renderPaymentsTable();
  }

  function renderPaymentsTable() {
    resultEl.innerHTML = "";

    if (currentDataArray.length === 0) return;

    const totalPages = Math.ceil(currentDataArray.length / pageSize);
    if (paginationControls) {
      if (totalPages > 1) {
        paginationControls.style.display = "flex";
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        btnPrev.disabled = currentPage === 1;
        btnNext.disabled = currentPage === totalPages;
      } else {
        paginationControls.style.display = "none";
      }
    }

    const table = document.createElement("table");
    table.className = "data-table";

    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>Transaction reference</th>
        <th>Payment date</th>
        <th>Amount</th>
        <th>Payment method</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(
      startIndex + pageSize,
      currentDataArray.length,
    );
    const pageRows = currentDataArray.slice(startIndex, endIndex);

    pageRows.forEach((row) => {
      const tr = document.createElement("tr");
      const ref = paymentTransactionRef(row);
      const payDate = paymentPaymentDateValue(row);

      tr.innerHTML = `
        <td>${escapeHtml(ref)}</td>
        <td>${formatPaymentDateTime(payDate)}</td>
        <td>${paymentAmountDisplay(row)}</td>
        <td>${paymentMethodDisplay(row)}</td>
        <td>${paymentStatusDisplay(row)}</td>
        <td><button type="button" class="view-payment-detail-btn">View details</button></td>
      `;

      const detailBtn = tr.querySelector(".view-payment-detail-btn");
      if (detailBtn) {
        detailBtn.addEventListener("click", () => openPaymentDetailModal(row));
      }
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    resultEl.appendChild(table);
  }

  function openPaymentDetailModal(row) {
    const modal = document.getElementById("paymentDetailModal");
    const body = document.getElementById("paymentDetailContent");
    const title = document.getElementById("paymentDetailTitle");
    if (!modal || !body) {
      console.error("Payment detail modal markup is missing.");
      return;
    }

    const ref = paymentTransactionRef(row);
    if (title) {
      title.textContent = `Payment — ${ref}`;
    }

    const txDisplay = escapeHtml(ref);
    const paymentDateDisplay = formatPaymentDateTime(
      paymentPaymentDateValue(row),
    );
    const paymentMethodDetail = paymentMethodDisplay(row);
    const createdAtDisplay = formatPaymentDateTime(
      paymentCreatedAtValue(row),
    );
    const updatedAtDisplay = formatPaymentDateTime(
      paymentUpdatedAtValue(row),
    );

    body.innerHTML = `
      <div class="forecast-detail-field">
        <span class="forecast-detail-label">Transaction reference</span>
        <span class="forecast-detail-value">${txDisplay}</span>
      </div>
      <div class="forecast-detail-field">
        <span class="forecast-detail-label">Payment date</span>
        <span class="forecast-detail-value">${paymentDateDisplay}</span>
      </div>
      <div class="forecast-detail-field">
        <span class="forecast-detail-label">Payment method</span>
        <span class="forecast-detail-value">${paymentMethodDetail}</span>
      </div>
      <div class="forecast-detail-field">
        <span class="forecast-detail-label">Created at</span>
        <span class="forecast-detail-value">${createdAtDisplay}</span>
      </div>
      <div class="forecast-detail-field">
        <span class="forecast-detail-label">Updated at</span>
        <span class="forecast-detail-value">${updatedAtDisplay}</span>
      </div>
    `;

    modal.style.display = "block";
  }

  function showError(err) {
    hideSalesGraph();
    if (salesChart) {
      salesChart.destroy();
      salesChart = null;
    }
    if (paginationControls) paginationControls.style.display = "none";
    resultEl.innerHTML = `<div class="error-state">Error: ${err.message || err}</div>`;
  }

  function showLoading(msg) {
    hideSalesGraph();
    if (salesChart) {
      salesChart.destroy();
      salesChart = null;
    }
    if (paginationControls) paginationControls.style.display = "none";
    resultEl.innerHTML = `<div class="loading-state">${msg}</div>`;
  }

  async function get(path) {
    const token = localStorage.getItem("token"); 
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(path, { headers }); 
    
    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/index.html"; 
      }
      throw new Error(res.status + " " + res.statusText);
    }
    return res.json();
  }

document.getElementById("btnOrders").addEventListener("click", async () => {
  hideForecastHistory();
  showLoading("Loading orders...");

  try {
    const data = await get(`${apiBase}/sales/orders`);
    showOrders(data);
  } catch (e) {
    showError(e);
  }
});

  function showOrders(orders) {
    hideSalesGraph();
    if (salesChart) {
      salesChart.destroy();
      salesChart = null;
    }
    
    resultEl.innerHTML = "";
    if (paginationControls) paginationControls.style.display = "none";

    let dataArray = Array.isArray(orders) ? orders : [orders];
    if (!Array.isArray(orders) && typeof orders === "object" && orders !== null) {
      if (Array.isArray(orders.data)) {
        dataArray = orders.data;
      }
    }

    if (!dataArray || dataArray.length === 0) {
      resultEl.innerHTML = '<div class="empty-state">No orders available.</div>';
      return;
    }

    currentView = "orders";
    currentDataArray = dataArray;
    currentPage = 1;
    renderOrdersTable();
  }

  function renderOrdersTable() {
    resultEl.innerHTML = "";

    if (currentDataArray.length === 0) return;

    const totalPages = Math.ceil(currentDataArray.length / pageSize);
    if (paginationControls) {
      if (totalPages > 1) {
        paginationControls.style.display = "flex";
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        btnPrev.disabled = currentPage === 1;
        btnNext.disabled = currentPage === totalPages;
      } else {
        paginationControls.style.display = "none";
      }
    }

    const table = document.createElement("table");
    table.className = "data-table";

    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>Customer Name</th>
        <th>Email</th>
        <th>Contact Number</th>
        <th>Total Amount</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, currentDataArray.length);
    const paginatedData = currentDataArray.slice(startIndex, endIndex);

    paginatedData.forEach(order => {
      const tr = document.createElement("tr");
      const customerName = order.customer_info?.name || "-";
      const email = order.customer_info?.email || "-";
      const contact = order.customer_info?.contact_number || "-";
      const totalAmount = order.total_amount !== undefined ? '$' + order.total_amount : "-";
      const status = order.order_status || order.payment_status || "-";

      tr.innerHTML = `
        <td>${escapeHtml(customerName)}</td>
        <td>${escapeHtml(email)}</td>
        <td>${escapeHtml(contact)}</td>
        <td>${escapeHtml(totalAmount)}</td>
        <td>${escapeHtml(status)}</td>
        <td><button type="button" class="view-order-btn">View Order</button></td>
      `;

      const viewBtn = tr.querySelector(".view-order-btn");
      if (viewBtn) {
        viewBtn.addEventListener("click", () => showOrderPopup(order));
      }

      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    resultEl.appendChild(table);
  }

  function showOrderPopup(order) {
    const modal = document.getElementById("orderModal");
    const modalContent = document.getElementById("orderDetailsContent");
    if (!modal || !modalContent) {
      console.error("Order modal markup is missing.");
      return;
    }

    let itemsHtml = '<p>No items found.</p>';
    if (order.items && order.items.length > 0) {
      itemsHtml = '<table class="data-table"><thead><tr><th>Product</th><th>Quantity</th><th>Price</th><th>Subtotal</th></tr></thead><tbody>';
      order.items.forEach(item => {
        const label = escapeHtml(item.product_name || item.product_id || "-");
        const qty = escapeHtml(item.quantity ?? 1);
        const price = escapeHtml(item.price ?? 0);
        const sub = escapeHtml(item.subtotal ?? 0);
        itemsHtml += `
          <tr>
            <td>${label}</td>
            <td>${qty}</td>
            <td>$${price}</td>
            <td>$${sub}</td>
          </tr>
        `;
      });
      itemsHtml += '</tbody></table>';
    }

    const orderId = escapeHtml(order.order_id || "-");
    const dateStr = escapeHtml(
      order.createdAt ? new Date(order.createdAt).toLocaleString() : "-",
    );
    const shipFee = escapeHtml(order.shipping_fee ?? 0);
    const addr = escapeHtml(order.customer_info?.delivery_address || "-");

    modalContent.innerHTML = `
      <div style="margin-bottom: 16px;">
        <strong>Order ID:</strong> ${orderId}<br/>
        <strong>Date:</strong> ${dateStr}<br/>
        <strong>Shipping Fee:</strong> $${shipFee}<br/>
        <strong>Delivery Address:</strong> ${addr}<br/>
      </div>
      <h3>Items</h3>
      ${itemsHtml}
    `;

    modal.style.display = "block";
  }

  // Close modal functionality
  const closeModalBtn = document.getElementById('closeOrderModal');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      document.getElementById('orderModal').style.display = 'none';
    });
  }

  window.addEventListener("click", (event) => {
    const orderModal = document.getElementById("orderModal");
    const forecastDetailModal = document.getElementById("forecastDetailModal");
    const paymentDetailModal = document.getElementById("paymentDetailModal");
    if (orderModal && event.target === orderModal) {
      orderModal.style.display = "none";
    }
    if (forecastDetailModal && event.target === forecastDetailModal) {
      forecastDetailModal.style.display = "none";
    }
    if (paymentDetailModal && event.target === paymentDetailModal) {
      paymentDetailModal.style.display = "none";
    }
  });

  const closeForecastDetailBtn = document.getElementById(
    "closeForecastDetailModal",
  );
  if (closeForecastDetailBtn) {
    closeForecastDetailBtn.addEventListener("click", () => {
      const m = document.getElementById("forecastDetailModal");
      if (m) m.style.display = "none";
    });
  }

  const closePaymentDetailBtn = document.getElementById(
    "closePaymentDetailModal",
  );
  if (closePaymentDetailBtn) {
    closePaymentDetailBtn.addEventListener("click", () => {
      const m = document.getElementById("paymentDetailModal");
      if (m) m.style.display = "none";
    });
  }

  document.getElementById("btnPayments").addEventListener("click", async () => {
  hideForecastHistory();
  showLoading("Loading payments...");

  try {
    const data = await get(`${apiBase}/sales/payments`);
    showPayments(data);
  } catch (e) {
    showError(e);
  }
});

document.getElementById("btnInventory")
  .addEventListener("click", async () => {

    hideForecastHistory();

    showLoading("Loading inventory...");
    try {
      const data = await get(`${apiBase}/inventory/`);
      show(data);
    } catch (e) {
      showError(e);
    }
  });

document.getElementById("btnForecast").addEventListener("click", async () => {
  showLoading("Loading forecast...");

  try {
    const data = await get(`${apiBase}/forecast/`);
    showForecast(data);
  } catch (e) {
    showError(e);
  }
});
  // Sales Graph functionality
  function showSalesGraph() {
    if (paginationControls) paginationControls.style.display = "none";
    resultEl.style.display = "none";
    salesGraphContainer.style.display = "block";
  }

  function hideSalesGraph() {
    salesGraphContainer.style.display = "none";
    resultEl.style.display = "block";
    hideForecastHistory();
  }

 function processSalesData(orders) {
    const salesByDate = {};
    let totalSales = 0;
    let totalOrders = 0;

    orders.forEach(order => {
      const status = (order.payment_status || order.status || '').toString().trim().toLowerCase();
      
      if (status && status !== 'confirmed' && status !== 'completed') {
        return; 
      }

      const dateString = order.payment_date || order.createdAt || order.orderDate || Date.now();
      const date = new Date(dateString);
      const dateKey = date.toLocaleDateString();
      
      const rawAmount = order.payment_amount ?? order.total ?? order.amount ?? order.total_amount ?? 0;
      const orderTotal = parseFloat(rawAmount);
      
      if (!salesByDate[dateKey]) {
        salesByDate[dateKey] = 0;
      }
      
      salesByDate[dateKey] += orderTotal;
      totalSales += orderTotal;
      totalOrders++;
    });

    console.log("Final Calculated Totals:", { totalSales, totalOrders });

    return {
      salesByDate,
      totalSales,
      totalOrders,
      averageOrder: totalOrders > 0 ? totalSales / totalOrders : 0
    };
  }

  function createChart(labels, data) {
    const ctx = document.getElementById('salesChart').getContext('2d');
    
    if (salesChart) {
      salesChart.destroy();
    }

    const chartConfig = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Sales ($)',
          data: data,
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          borderColor: 'rgba(37, 99, 235, 1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return '$' + context.parsed.y?.toFixed(2);
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + value.toFixed(0);
              }
            }
          }
        }
      }
    };

    salesChart = new Chart(ctx, chartConfig);
  }

  function updateStats(stats) {
    document.getElementById('totalSales').textContent = '$' + stats.totalSales.toFixed(2);
    document.getElementById('avgOrder').textContent = '$' + stats.averageOrder.toFixed(2);
    document.getElementById('totalOrders').textContent = stats.totalOrders.toString();
  }

  async function loadSalesGraph() {
  showSalesGraph();

  const selectedRange = document.getElementById('timeRange').value;

  let timeRange = 7;

  if (selectedRange === "daily") {
    timeRange = 7;
  } else if (selectedRange === "weekly") {
    timeRange = 30;
  } else if (selectedRange === "monthly") {
    timeRange = 90;
  }

  try {
    const orders = await get(`${apiBase}/sales/orders`);

    if (!Array.isArray(orders)) {
      throw new Error('Invalid sales data format');
    }

    const processedData = processSalesData(orders);

    const allDates = Object.keys(processedData.salesByDate).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    const newestDate =
      allDates.length > 0
        ? new Date(allDates[allDates.length - 1])
        : new Date();

    const recentDates = [];
    const recentData = [];

    for (let i = timeRange - 1; i >= 0; i--) {
      const targetDate = new Date(newestDate);
      targetDate.setDate(newestDate.getDate() - i);

      const dateKey = targetDate.toLocaleDateString();

      recentDates.push(dateKey);

      // Use 0 if no sales on that day
      recentData.push(processedData.salesByDate[dateKey] || 0);
    }

    createChart(recentDates, recentData);
    updateStats(processedData);

    const historyEl = document.getElementById("forecastSalesHistory");
    if (historyEl) historyEl.style.display = "block";
    loadDailySales();

  } catch (error) {
    console.error('Error loading sales graph:', error);
    showError(error);
    hideSalesGraph();
  }
}

  // Event listeners for sales graph
document.getElementById("btnSalesGraph").addEventListener("click", async () => {
  loadSalesGraph();
});  
  document.getElementById("refreshGraph")?.addEventListener("click", loadSalesGraph);
  
  document.getElementById("timeRange")?.addEventListener("change", loadSalesGraph);

  // Logout functionality
  document.getElementById("btnLogout")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/login.html";
});

async function loadDailySales() {
  const tbody = document.getElementById("dailyTableBody");
  if (!tbody) return;

  tbody.innerHTML = "Loading...";

  try {
    const orders = await get(`${apiBase}/sales/orders`);

    const grouped = {};

    orders.forEach(order => {
      const product =
        order.items?.[0]?.product_name ||
        order.product_name ||
        "Unknown Product";

      const day = new Date(order.createdAt).toLocaleDateString();

      const amount = parseFloat(order.total_amount || 0);

      const key = product + "-" + day;

      if (!grouped[key]) {
        grouped[key] = {
          product,
          day,
          total: 0
        };
      }

      grouped[key].total += amount;
    });

    const rows = Object.values(grouped)
      .map(row => `
        <tr>
          <td>${row.product}</td>
          <td>${row.day}</td>
          <td>$${row.total.toFixed(2)}</td>
        </tr>
      `)
      .join("");

    tbody.innerHTML = rows || `<tr><td colspan="3">No data available</td></tr>`;

  } catch (err) {
    console.error("Daily load error:", err);
    tbody.innerHTML = `<tr><td colspan="3">Error loading daily data</td></tr>`;
  }
}

async function loadWeeklySales() {
  const tbody = document.getElementById("weeklyTableBody");
  if (!tbody) return;

  tbody.innerHTML = "Loading...";

  try {
    const orders = await get(`${apiBase}/sales/orders`);

    const grouped = {};
    const periodTotals = {};

    orders.forEach(order => {
      const date = new Date(order.createdAt);

      const day = date.getDay();
      const diffToMonday = (day === 0 ? -6 : 1) - day;

      const start = new Date(date);
      start.setDate(date.getDate() + diffToMonday);

      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      const weekKey = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;

      const product = order.items?.[0]?.product_name || "Unknown Product";
      const amount = parseFloat(order.total_amount || 0);

      const key = weekKey + "-" + product;

      // product-level grouping
      if (!grouped[key]) {
        grouped[key] = {
          product,
          period: weekKey,
          total: 0
        };
      }

      grouped[key].total += amount;

      // period total (ALL products)
      if (!periodTotals[weekKey]) {
        periodTotals[weekKey] = 0;
      }
      periodTotals[weekKey] += amount;
    });

    tbody.innerHTML = Object.values(grouped)
      .map(row => `
        <tr>
          <td>${row.product}</td>
          <td>${row.period}</td>
          <td>$${row.total.toFixed(2)}</td>
          <td>$${periodTotals[row.period].toFixed(2)}</td>
        </tr>
      `)
      .join("");

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4">Error loading weekly data</td></tr>`;
  }
}

async function loadMonthlySales() {
  const tbody = document.getElementById("monthlyTableBody");
  if (!tbody) return;

  tbody.innerHTML = "Loading...";

  try {
    const orders = await get(`${apiBase}/sales/orders`);

    const grouped = {};
    const periodTotals = {};

    orders.forEach(order => {
      const date = new Date(order.createdAt);

      const monthKey = date.toLocaleString('default', {
        month: 'long',
        year: 'numeric'
      });

      const product = order.items?.[0]?.product_name || "Unknown Product";
      const amount = parseFloat(order.total_amount || 0);

      const key = monthKey + "-" + product;

      // product-level grouping
      if (!grouped[key]) {
        grouped[key] = {
          product,
          period: monthKey,
          total: 0
        };
      }

      grouped[key].total += amount;

      // month-level total
      if (!periodTotals[monthKey]) {
        periodTotals[monthKey] = 0;
      }
      periodTotals[monthKey] += amount;
    });

    tbody.innerHTML = Object.values(grouped)
      .map(row => `
        <tr>
          <td>${row.product}</td>
          <td>${row.period}</td>
          <td>$${row.total.toFixed(2)}</td>
          <td>$${periodTotals[row.period].toFixed(2)}</td>
        </tr>
      `)
      .join("");

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4">Error loading monthly data</td></tr>`;
  }
}

window.switchSalesTab = function(tabName) {

  document.querySelectorAll(".sales-tabs .tab").forEach(button => {
    button.classList.remove("active");
  });

  document.querySelectorAll(".tab-content").forEach(content => {
    content.classList.remove("active");
  });

  const clickedButton = document.querySelector(
    `.sales-tabs .tab[onclick="switchSalesTab('${tabName}')"]`
  );

  if (clickedButton) {
    clickedButton.classList.add("active");
  }

  const selectedTab = document.getElementById(`${tabName}-tab`);
  if (selectedTab) {
    selectedTab.classList.add("active");
  }

  if (tabName === "daily") loadDailySales();
  if (tabName === "weekly") loadWeeklySales();
  if (tabName === "monthly") loadMonthlySales();
};
})();