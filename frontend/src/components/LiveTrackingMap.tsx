import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapPoint {
  lat: number;
  lng: number;
  label: string;
  sublabel?: string;
  type: 'pickup' | 'dropoff' | 'volunteer';
}

interface LiveTrackingMapProps {
  pickup: { lat: number; lng: number; address: string; name?: string };
  dropoff: { lat: number; lng: number; address: string; name?: string };
  volunteer?: { lat: number; lng: number; name?: string };
  height?: string;
}

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  pickup,
  dropoff,
  volunteer,
  height = '420px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Cleanup previous map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView([pickup.lat, pickup.lng], 13);

    // OpenStreetMap tiles with attribution
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Custom modern DivIcons
    const createCustomIcon = (bgColor: string, symbol: string) => {
      return L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="background-color: ${bgColor}; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.25);">
            ${symbol}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
    };

    const pickupIcon = createCustomIcon('#166534', '🍲');
    const dropoffIcon = createCustomIcon('#2563eb', '🏠');
    const volunteerIcon = createCustomIcon('#d97706', '🚴');

    // Markers
    const pickupMarker = L.marker([pickup.lat, pickup.lng], { icon: pickupIcon })
      .addTo(map)
      .bindPopup(`<b>Pickup Location</b><br/>${pickup.name || 'Donor'}<br/><small>${pickup.address}</small>`);

    const dropoffMarker = L.marker([dropoff.lat, dropoff.lng], { icon: dropoffIcon })
      .addTo(map)
      .bindPopup(`<b>Destination</b><br/>${dropoff.name || 'NGO Shelter'}<br/><small>${dropoff.address}</small>`);

    const latLngs: L.LatLngExpression[] = [
      [pickup.lat, pickup.lng],
      [dropoff.lat, dropoff.lng],
    ];

    if (volunteer) {
      L.marker([volunteer.lat, volunteer.lng], { icon: volunteerIcon })
        .addTo(map)
        .bindPopup(`<b>Active Volunteer</b><br/>${volunteer.name || 'Volunteer Courier'}<br/><small>Live location in transit</small>`)
        .openPopup();
      latLngs.splice(1, 0, [volunteer.lat, volunteer.lng]);
    } else {
      pickupMarker.openPopup();
    }

    // Connect points with route polyline
    L.polyline(latLngs, {
      color: '#166534',
      weight: 4,
      opacity: 0.8,
      dashArray: '8, 8',
    }).addTo(map);

    // Fit bounds to include all points comfortably
    const bounds = L.latLngBounds(latLngs);
    map.fitBounds(bounds, { padding: [50, 50] });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [pickup, dropoff, volunteer]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-xl shadow-md border border-slate-200 z-1000 text-xs flex items-center space-x-3">
        <span className="flex items-center space-x-1.5 text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 inline-block"></span>
          <span>Pickup</span>
        </span>
        <span className="flex items-center space-x-1.5 text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block animate-pulse"></span>
          <span>Volunteer</span>
        </span>
        <span className="flex items-center space-x-1.5 text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
          <span>NGO</span>
        </span>
      </div>
    </div>
  );
};

