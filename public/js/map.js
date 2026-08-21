let mapDiv = document.getElementById("map");
if (mapDiv) {
  let Location = mapDiv.dataset.location || "New Delhi";
  let Country = mapDiv.dataset.country || "India";
  let place = Location + ", " + Country;

  function renderMap(lat, lon, zoomLevel = 12) {
    if (typeof L === "undefined") return;
    var map = L.map('map').setView([lat, lon], zoomLevel);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    var customIcon = L.icon({
      iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
      iconSize: [35, 35]
    });

    L.marker([lat, lon], { icon: customIcon })
      .addTo(map)
      .bindPopup(`
        <div style="text-align:center;">
          <h5>${place}</h5>
          <p>📍 Exact location will be provided after booking</p>
        </div>
      `)
      .openPopup();
  }

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`)
    .then((res) => res.json())
    .then((data) => {
      if (data && data.length > 0) {
        renderMap(parseFloat(data[0].lat), parseFloat(data[0].lon), 12);
      } else {
        renderMap(28.6139, 77.2090, 8); // Fallback to New Delhi
      }
    })
    .catch((err) => {
      console.log("Map Geocoding Error:", err);
      renderMap(28.6139, 77.2090, 8);
    });
}