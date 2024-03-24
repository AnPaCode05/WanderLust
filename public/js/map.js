mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: listing.geometry.coordinates,
  zoom: 10,
});



// const marker = new mapboxgl.Marker({ color: 'red' })
//   .setLngLat(listing.geometry.coordinates)
//   .setPopup(new mapboxgl.Popup({ offset: 25 })
//     .setHTML(`<h4>${listing.title}</h4><p>Exact Location will be provided after booking</p>`))
//   .addTo(map);


map.on('load', () => {
  // Load an image from an external URL.
  map.loadImage(
    'https://static-00.iconduck.com/assets.00/airbnb-icon-1024x1024-pg2bnyz7.png',
    (error, image) => {
      if (error) throw error;

      // Add the image to the map style.
      map.addImage('cat', image);

      // Add a data source containing one point feature.
      map.addSource('point', {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': [
            {
              'type': 'Feature',
              'geometry': {
                'type': 'Point',
                'coordinates': listing.geometry.coordinates
              }
            }
          ]
        }
      });

      // Add a layer to use the image to represent the data.
      map.addLayer({
        'id': 'points',
        'type': 'symbol',
        'source': 'point', // reference the data source
        'layout': {
          'icon-image': 'cat', // reference the image
          'icon-size': 0.04
        }
      });

      // Create a popup
      var popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`<h4>${listing.title}</h4><p>Exact Location will be provided after booking</p>`);

      // Add popup to the marker
      new mapboxgl.Marker()
        .setLngLat(listing.geometry.coordinates)
        .setPopup(popup) // bind the popup to the marker
        .addTo(map);
    }
  );
});