const apiKey = "3cf4b430cb7149aa81f102452251905";

// Tab switch logic
function showTab(tabId, el) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active-tab'));
  document.getElementById(tabId).classList.add('active-tab');

  document.querySelectorAll("nav a").forEach(a => a.classList.remove("active"));
  el.classList.add("active");
}

// Get current weather
async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return;
  const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    document.getElementById("weatherResult").innerHTML = `
      <div class="weather-grid">
        <div class="weather-left">
          <h2>${data.location.name}, ${data.location.country}</h2>
          <img src="https:${data.current.condition.icon}" alt="Weather Icon">
          <p><strong>${data.current.condition.text}</strong></p>
        </div>
        <div class="weather-right">
          <p>🌡 Temperature: ${data.current.temp_c}°C</p>
          <p>🌎 Feels Like: ${data.current.feelslike_c}°C</p>
          <p>☁️ Condition: ${data.current.condition.text}</p>
          <p>💧 Humidity: ${data.current.humidity}%</p>
          <p>🌬 Wind: ${data.current.wind_kph} kph</p>
          <p>🌧 Precipitation: ${data.current.precip_mm} mm</p>
          <p>🧭 Wind Direction: ${data.current.wind_dir}</p>
        </div>
      </div>
    `;
  } catch (err) {
    document.getElementById("weatherResult").innerHTML = `<p style="color:red;">${err.message}</p>`;
  }
}

// Forecast + Chart + Report
async function getForecast() {
  const city = document.getElementById("forecastCity").value.trim();
  const days = document.getElementById("forecastDays").value;
  if (!city || days < 1 || days > 7) return;

  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=${days}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const labels = data.forecast.forecastday.map(day => day.date);
    const temps = data.forecast.forecastday.map(day => day.day.avgtemp_c);

    console.log(`Received ${data.forecast.forecastday.length} forecast days`);

    const ctx = document.getElementById("forecastChart").getContext("2d");

    if (window.forecastChartObj) window.forecastChartObj.destroy();

    window.forecastChartObj = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          label: `Avg Temp (°C)`,
          data: temps,
          fill: true,
          backgroundColor: "rgba(0, 123, 255, 0.2)",
          borderColor: "#007bff",
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: false }
        }
      }
    });

    // ✅ Forecast textual report
    let reportHTML = "";
    data.forecast.forecastday.forEach(day => {
      reportHTML += `
        <p><strong>${day.date}:</strong> ${day.day.condition.text}, 
        Avg Temp: ${day.day.avgtemp_c}°C, 
        Max: ${day.day.maxtemp_c}°C, 
        Min: ${day.day.mintemp_c}°C, 
        Humidity: ${day.day.avghumidity}%, 
        Chance of Rain: ${day.day.daily_chance_of_rain}%</p>
      `;
    });
    document.getElementById("forecastReport").innerHTML = reportHTML;
    document.getElementById("forecastReport").style.display = "none"; // initially hidden

  } catch (err) {
    alert("Error fetching forecast data.");
  }
}

function toggleForecastReport() {
  const reportBox = document.getElementById("forecastReport");
  const btn = event.target;
  if (reportBox.style.display === "none" || reportBox.style.display === "") {
    reportBox.style.display = "block";
    btn.innerText = "Hide Report";
  } else {
    reportBox.style.display = "none";
    btn.innerText = "Show Complete Report";
  }
}

// Auto-suggestion
function setupAutoSuggest(inputId) {
  const input = document.getElementById(inputId);
  const suggestionBox = document.getElementById("suggestion-" + inputId);

  input.addEventListener("input", async function () {
    const query = this.value.trim();
    if (query.length < 2) {
      suggestionBox.innerHTML = "";
      return;
    }

    const url = `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${query}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      suggestionBox.innerHTML = "";
      data.forEach(place => {
        const div = document.createElement("div");
        div.textContent = `${place.name}, ${place.country}`;
        div.addEventListener("click", () => {
          input.value = place.name;
          suggestionBox.innerHTML = "";
        });
        suggestionBox.appendChild(div);
      });
    } catch (err) {
      suggestionBox.innerHTML = "";
    }
  });

  document.addEventListener("click", (e) => {
    if (!suggestionBox.contains(e.target) && e.target !== input) {
      suggestionBox.innerHTML = "";
    }
  });
}

// Init suggestions
setupAutoSuggest("cityInput");
setupAutoSuggest("forecastCity");
