let poopCount = 0;

// Fetch the user's country using ipinfo.io API
async function fetchCountry() {
  try {
    const response = await fetch("https://ipinfo.io/json?token=5b46d0c8c90d54"); // Replace with your valid token
    const data = await response.json();
    return data.country; // Return country code (e.g., "US", "CA")
  } catch (error) {
    console.error("Error fetching country data:", error);
    return "Unknown"; // Default to "Unknown" if the API fails
  }
}

// Send country click to backend
async function sendStatsToServer(country) {
  try {
    await fetch("http://localhost:3000/update-stats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ country }),
    });
  } catch (error) {
    console.error("Error sending stats to server:", error);
  }
}

// Fetch aggregated stats from backend
async function fetchAggregatedStats() {
  try {
    const response = await fetch("http://localhost:3000/stats");
    const stats = await response.json();

    // Display aggregated stats
    const statsContainer = document.getElementById("stats");
    statsContainer.innerHTML = "<h3>Aggregated Country Stats</h3>"; // Add heading

    // Sort countries by number of clicks (descending order)
    const sortedStats = Object.entries(stats).sort((a, b) => b[1] - a[1]);

    sortedStats.forEach(([countryCode, count]) => {
      const stat = document.createElement("div");
      const flag = countryCode !== "Unknown" ? `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png` : null;
      stat.innerHTML = `
        ${flag ? `<img src="${flag}" alt="${countryCode} Flag" style="width: 20px; margin-right: 5px;">` : ""}
        ${countryCode}: ${count} clicks
      `;
      statsContainer.appendChild(stat);
    });
  } catch (error) {
    console.error("Error fetching aggregated stats:", error);
  }
}

// Main click event listener
document.getElementById("click-me").addEventListener("click", async function (event) {
  poopCount++;
  document.getElementById("counter").textContent = `You pooped ${poopCount} times!`;

  // Get the user's country
  const country = await fetchCountry();

  // Update stats on backend
  await sendStatsToServer(country);

  // Fetch and display updated aggregated stats
  fetchAggregatedStats();

  // Create a new poop element
  const newPoop = document.createElement("img");
  newPoop.src = "poop.png";
  newPoop.className = "dropped";
  newPoop.style.position = "absolute";

  // Position the poop based on the click location
  const buttonRect = event.target.getBoundingClientRect();
  const clickX = event.clientX;
  const clickY = event.clientY;

  newPoop.style.left = `${clickX - buttonRect.width / 2}px`; // Adjust poop position horizontally
  newPoop.style.top = `${clickY}px`; // Adjust poop position vertically

  // Append the new poop to the body temporarily
  document.body.appendChild(newPoop);

  // Position the toilet
  const toilet = document.getElementById("toilet");
  const toiletRect = toilet.getBoundingClientRect();

  // Animate the poop dropping into the toilet
  const dropAnimation = newPoop.animate(
    [
      { transform: "translateY(0px)" },
      { transform: `translateY(${toiletRect.top - clickY + toiletRect.height}px)` },
    ],
    {
      duration: 500,
      easing: "ease-in",
    }
  );

  // Remove the poop after the animation finishes
  dropAnimation.onfinish = () => {
    newPoop.remove(); // Poop disappears after dropping into the toilet
  };
});

// Initialize stats display on page load
fetchAggregatedStats();
