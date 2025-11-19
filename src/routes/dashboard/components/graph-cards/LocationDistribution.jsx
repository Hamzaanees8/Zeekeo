import { useCallback, useRef, useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "279px" };
const center = { lat: 20, lng: 0 };
const LIBRARIES = ["places"];

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

const DEFAULT_COLORS = [
  "#03045E",
  "#04479C",
  "#0077B6",
  "#0096C7",
  "#00B4D8",
  "#28F0E6",
  "#12D7A8",
  "#25C396",
];

const LocationDistribution = ({
  data = [],
  tooltipText = null,
  lastUpdated = null,
}) => {
  const mapRef = useRef(null);
  const markerRefs = useRef([]);
  const [locations, setLocations] = useState([]);
  const [activeMarker, setActiveMarker] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  const onLoad = useCallback(map => {
    mapRef.current = map;
  }, []);

useEffect(() => {
    if (!isLoaded) return;
    
    // Reset locations immediately to show an empty map/loader while geocoding
    setLocations([]);
    setActiveMarker(null);
    
    if (!data || data.length === 0) {
        return;
    }

    // Since window.google.maps is available, you can instantiate Geocoder here
    const geocoder = new window.google.maps.Geocoder();
    
    // Use a flag to prevent setting state if the component unmounts or data changes again
    let isMounted = true; 

    const fetchLocations = async () => {
        const results = [];
        const totalCount = data.reduce((sum, item) => sum + item.count, 0);

        // Geocoding requests should ideally be debounced or batched, but we'll stick to iteration for now.
        for (let i = 0; i < data.length; i++) {
            const { title, count } = data[i];
            const color = DEFAULT_COLORS[i % DEFAULT_COLORS.length];
            const percentage = ((count / totalCount) * 100).toFixed(1);
            
            // Assign color and percentage to the original data object if needed for the legend:
            // data[i].color = color; 
            // data[i].percentage = percentage;

            try {
                const res = await geocoder.geocode({ address: title });
                if (res.results?.length) {
                    const { lat, lng } = res.results[0].geometry.location;
                    results.push({
                        name: title,
                        count,
                        percentage,
                        lat: lat(),
                        lng: lng(),
                        color,
                    });
                }
            } catch (err) {
                console.error("Geocode failed:", title, err);
            }
        }

        // Only update state if the component is still mounted
        if (isMounted) {
            setLocations(results);
        }
    };

    fetchLocations();
    
    // Cleanup function to set the flag to false if the component unmounts
    return () => {
        isMounted = false;
    };
}, [data, isLoaded]); // The dependency array is correct

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

  return (
    <div className="bg-white p-3 shadow-md rounded h-full">
      <div className="text-[16px] text-[#1E1D1D] mb-4">
        Location Distribution
      </div>

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
            {locations.map((loc, i) => (
              <Marker
                key={i}
                position={{ lat: loc.lat, lng: loc.lng }}
                icon={createSvgIcon(loc.color)}
                animation={window.google.maps.Animation.DROP}
                onLoad={marker => (markerRefs.current[i] = marker)}
                onMouseOver={() => {
                  const marker = markerRefs.current[i];
                  if (marker)
                    marker.setAnimation(window.google.maps.Animation.BOUNCE);
                }}
                onMouseOut={() => {
                  const marker = markerRefs.current[i];
                  if (marker) marker.setAnimation(null);
                }}
                onClick={() => setActiveMarker(i)}
              >
                {activeMarker === i && (
                  <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                    <div className="text-[12px]">
                      <strong>{loc.name}</strong>
                      <div>Count: {loc.count}</div>
                      <div>Percentage: {loc.percentage}%</div>
                    </div>
                  </InfoWindow>
                )}
              </Marker>
            ))}
          </GoogleMap>
        ) : (
          <div className="text-center p-8">Loading map…</div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-2 mt-4 max-h-30 overflow-y-auto pr-1 custom-scroll">
        {data.map((loc, i) => (
          <div key={i} className="flex items-center text-[12px] text-gray-600">
            <span
              className="w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: loc.color }}
            />
            {loc.title} ({loc.count} / {loc.percentage}%)
          </div>
        ))}
      </div>

      {/* Last Updated + Tooltip */}
      <div className="flex items-center justify-end mt-4 self-end bottom-2 text-[#7E7E7E]">
        {lastUpdated && (
          <span className="italic text-[11px] text-gray-500">
            Last updated {lastUpdated}
          </span>
        )}
        {tooltipText && <TooltipInfo text={tooltipText} />}
      </div>
    </div>
  );
};

export default LocationDistribution;
