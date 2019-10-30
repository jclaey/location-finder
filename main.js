// OpenStreetMap API key
const osmKey = '<yourkey>';

// Check to make sure geolocation is supported by the browser
if ("geolocation" in navigator) {

    // Check state of location permission in browser
    navigator.permissions.query({name:'geolocation'}).then(result => {
        // If location permission has been denied, display zip code input
        if(result.state == 'denied') {
            document.getElementById('permission').style.display = 'block';
        } else {
            
          // Get user latitude and longitude using HTML5 geolocation API
    navigator.geolocation.getCurrentPosition(position => {
        let userLat = position.coords.latitude;
        let userLng = position.coords.longitude;
        
        // Use OpenCage API 
        let openCageUrl = `https://api.opencagedata.com/geocode/v1/json?q=${userLat}+${userLng}&key=${osmKey}&pretty=1`;

        let openCageReq = new XMLHttpRequest();

        openCageReq.open('GET', openCageUrl, true);

        // Use OpenCage to transform user latitude and longitude to street address and extract zipcode
        openCageReq.onload = function() {
            if (openCageReq.status == 200){ 
                let data = JSON.parse(openCageReq.responseText);
                var geohash = data.results[0].annotations.geohash;
                var userZip = parseInt(data.results[0].components.postcode.slice(6));
        
            } else if (openCageReq.status <= 500){ 
              // We reached our target server, but it returned an error           
              console.log('unable to geocode! Response code: ' + openCageReq.status);
              let data = JSON.parse(openCageReq.responseText);
              console.log(data.status.message);
            } else {
              console.log('server error');
            }

            // Grab necessary HTML elements
            latLng = document.getElementById('latLng');
            zipcode = document.getElementById('zipcode');
            geo = document.getElementById('geohash');

            // Add values to HTML
            latLng.innerHTML = userLat + ', ' + userLng;
            zipcode.innerHTML = userZip;
            geo.innerHTML = geohash;

          };

          openCageReq.onerror = function() {
            // There was a connection error of some sort
            console.log('unable to connect to server');        
          };
        
          openCageReq.send();  // make the request

        // Create map with Leaflet.js
        // Set map center (user latitude and longitude)
        // Set zoom level (9)
        var map = L.map('mapID', { scrollWheelZoom: false }).setView([userLat, userLng], 9);

        // Set tile layer using OpenStreetMap tile server, set key (OpenStreetMap API key), set attribution info, and add to map
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{key}', {key: `${osmKey}`, attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'}).addTo(map);

        // Create marker and add to map
        var marker = L.marker([userLat, userLng]).addTo(map);
        
        // Create popup and add to marker
        marker.bindPopup("<b>Your<br>Location</b>").openPopup();

    });
        }
    });

} else {
    console.log('Geolocation not found');
}