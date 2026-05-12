(function () {
  const apiBase = "/api";
  const resultEl = document.getElementById("result");
  const salesGraphContainer = document.getElementById("salesGraphContainer");
  let salesChart = null;

  let currentDataArray = [];
  let currentHeaders = [];
  let currentPage = 1;
  const pageSize = 10;

  const paginationControls = document.getElementById("pagination-controls");
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");
  const pageInfo = document.getElementById("pageInfo");

  if (btnPrev && btnNext) {
    btnPrev.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable();
      }
    });
    btnNext.addEventListener("click", () => {
      const totalPages = Math.ceil(currentDataArray.length / pageSize);
      if (currentPage < totalPages) {
        currentPage++;
        renderTable();
      }
    });
  }

  function show(obj) {
    // Hide sales graph when showing other data
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
    currentHeaders = Array.from(allKeys);

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
        btnPrev.style.opacity = currentPage === 1 ? "0.5" : "1";
        btnPrev.style.cursor = currentPage === 1 ? "default" : "pointer";
        btnNext.style.opacity = currentPage === totalPages ? "0.5" : "1";
        btnNext.style.cursor = currentPage === totalPages ? "default" : "pointer";
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
    const res = await fetch(path);
    if (!res.ok) throw new Error(res.status + " " + res.statusText);
    return res.json();
  }

  document.getElementById("btnOrders").addEventListener("click", async () => {
    showLoading("Loading orders...");
    try {
      const data = await get(`${apiBase}/sales/orders`);
      show(data);
    } catch (e) {
      showError(e);
    }
  });

  document.getElementById("btnPayments").addEventListener("click", async () => {
    showLoading("Loading payments...");
    try {
      const data = await get(`${apiBase}/sales/payments`);
      show(data);
    } catch (e) {
      showError(e);
    }
  });

  document
    .getElementById("btnInventory")
    .addEventListener("click", async () => {
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
      const data = await get(`${apiBase}/forecast/generate-report`);
      show(data);
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
    
    const timeRange = parseInt(document.getElementById('timeRange').value);
    
    try {
      const orders = await get(`${apiBase}/sales/orders`);
      
      if (!Array.isArray(orders)) {
        throw new Error('Invalid sales data format');
      }

      const processedData = processSalesData(orders);
      
      // Sort dates and get recent data based on time range
      const sortedDates = Object.keys(processedData.salesByDate).sort((a, b) => 
        new Date(a) - new Date(b)
      );
      
      const recentDates = sortedDates.slice(-timeRange);
      const recentData = recentDates.map(date => processedData.salesByDate[date]);
      
      createChart(recentDates, recentData);
      updateStats(processedData);
      
    } catch (error) {
      console.error('Error loading sales graph:', error);
      showError(error);
      hideSalesGraph();
    }
  }

  // Event listeners for sales graph
  document.getElementById("btnSalesGraph")?.addEventListener("click", loadSalesGraph);
  
  document.getElementById("refreshGraph")?.addEventListener("click", loadSalesGraph);
  
  document.getElementById("timeRange")?.addEventListener("change", loadSalesGraph);

  // Logout functionality
  document.getElementById("btnLogout")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
  });
})();