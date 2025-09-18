import { useCallback, useRef } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "279px",
};

const center = { lat: 20, lng: 0 }; // Global centered view

// Greyscale world map (no labels)
const grayMapStyle = [
  {
    featureType: "all",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry.fill",
    stylers: [{ color: "#7e7e7e" }],
  },
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ visibility: "off" }],
  },
];

// Colored marker locations
const defaultLocations = [
  {
    name: "San Francisco, California",
    lat: 37.7749,
    lng: -122.4194,
    color: "#3F51B5",
  }, // San Francisco
  {
    name: "Los Angeles, California",
    lat: 34.0522,
    lng: -118.2437,
    color: "#25C396",
  }, // Los Angeles
  {
    name: "Mountain View, California, US",
    lat: 35.3861,
    lng: -102.0839,
    color: "#00B4D8",
  }, // Mountain View
  { name: "Italy", lat: 41.9028, lng: 12.4964, color: "#0077B6" }, // Italy
  { name: "South America", lat: -34.6037, lng: -58.3816, color: "#038D65" }, // South America
];

const LocationDistribution = () => {
  const mapRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const createSvgIcon = color => ({
    url: `data:image/svg+xml;base64,${btoa(`
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="6" fill="${color}" fill-opacity="1" />
      <circle cx="24" cy="24" r="10" stroke="${color}" stroke-width="2" fill="none" opacity="0.6"/>
      <circle cx="24" cy="24" r="14" stroke="${color}" stroke-width="2" fill="none" opacity="0.6"/>
    </svg>
  `)}`,
    scaledSize: new window.google.maps.Size(40, 40),
  });

  const onLoad = useCallback(map => {
    mapRef.current = map;
  }, []);

  return (
    <div className="bg-[#FFFFFF] p-[12px] shadow-md h-full rounded-[8px]">
      <div className="text-[16px] text-[#1E1D1D] mb-4 ">
        Location Distribution
      </div>

      {/* Map */}
      <div className="w-full overflow-hidden">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={1}
            onLoad={onLoad}
            options={{
              styles: grayMapStyle,
              disableDefaultUI: true,
              gestureHandling: "greedy",
            }}
          >
            {defaultLocations.map((loc, index) => (
              <Marker
                key={index}
                position={{ lat: loc.lat, lng: loc.lng }}
                icon={createSvgIcon(loc.color)}
              />
            ))}
          </GoogleMap>
        ) : (
          <div className="text-center p-8">Loading map…</div>
        )}
      </div>

      {/* Platform bullets */}
      <div className="flex flex-wrap items-center gap-[20px] mt-6">
        {defaultLocations.map((platform, index) => (
          <div
            key={index}
            className="flex items-center text-[12px] text-gray-600"
          >
            <span
              className={`w-2 h-2 rounded-full mr-2 `}
              style={{ backgroundColor: platform.color }}
            />
            {platform.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocationDistribution;
