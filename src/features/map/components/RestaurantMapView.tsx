import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseCuisines } from '@/utils';
import type { Restaurant } from '@/types';

// Fix default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const greenIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

function MapFlyTo({ position }: { position: [number, number] | null }) {
    const map = useMap();
    React.useEffect(() => {
        if (position) {
            map.flyTo(position, 17, { duration: 1.2 });
        }
    }, [position, map]);
    return null;
}

interface RestaurantMapViewProps {
    restaurants: Restaurant[];
}

export default function RestaurantMapView({ restaurants }: RestaurantMapViewProps) {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [showSuggestions, setShowSuggestions] = React.useState(false);
    const [flyToPosition, setFlyToPosition] = React.useState<[number, number] | null>(null);
    const searchRef = React.useRef<HTMLDivElement>(null);

    const validRestaurants = restaurants.filter(r => r.latitude && r.longitude);

    const suggestions = searchQuery.trim()
        ? validRestaurants.filter(r => {
            const q = searchQuery.toLowerCase();
            const cuisineMatch = parseCuisines(r.cuisine).some(c => c.toLowerCase().includes(q));
            return r.name.toLowerCase().includes(q) || cuisineMatch;
        }).slice(0, 8)
        : [];

    const defaultCenter: [number, number] = [3.139, 101.6869];
    const center = validRestaurants.length > 0
        ? [validRestaurants[0].latitude, validRestaurants[0].longitude] as [number, number]
        : defaultCenter;

    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (restaurant: Restaurant) => {
        setFlyToPosition([restaurant.latitude!, restaurant.longitude!]);
        setSearchQuery(restaurant.name);
        setShowSuggestions(false);
    };

    const handleClear = () => {
        setSearchQuery('');
        setShowSuggestions(false);
        setFlyToPosition(null);
    };

    if (validRestaurants.length === 0) {
        return (
            <div className="h-150 rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-center">
                <p className="text-neutral-500">No restaurants with location data to display on map.</p>
            </div>
        );
    }

    return (
        <div className="relative z-0 h-150 w-full rounded-xl overflow-hidden border border-neutral-200">
            {/* Search bar overlay */}
            <div ref={searchRef} className="absolute top-4 left-1/2 -translate-x-1/2 z-1000 w-full max-w-sm px-4">
                <div className="relative flex items-center bg-white rounded-2xl shadow-lg border border-neutral-200">
                    <Search className="absolute left-4 w-4 h-4 text-neutral-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search restaurants on map..."
                        value={searchQuery}
                        onChange={e => {
                            setSearchQuery(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => searchQuery && setShowSuggestions(true)}
                        className="w-full h-11 pl-10 pr-10 rounded-2xl text-sm bg-transparent outline-none text-neutral-900 placeholder:text-neutral-400"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-3 grid h-7 w-7 place-items-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="mt-1 bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden">
                        {suggestions.map(r => (
                            <button
                                key={r.id}
                                type="button"
                                onMouseDown={() => handleSelect(r)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors text-left"
                            >
                                <img
                                    src={r.profilepic || 'https://picsum.photos/seed/default/100/100'}
                                    alt={r.name}
                                    className="w-8 h-8 rounded-full object-cover shrink-0"
                                />
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-neutral-900 truncate">{r.name}</p>
                                    {parseCuisines(r.cuisine).length ? <p className="text-xs text-neutral-400 truncate">{parseCuisines(r.cuisine).join(' · ')}</p> : null}
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {showSuggestions && searchQuery.trim() && suggestions.length === 0 && (
                    <div className="mt-1 bg-white rounded-xl shadow-lg border border-neutral-200 px-4 py-3">
                        <p className="text-sm text-neutral-400">No restaurants found</p>
                    </div>
                )}
            </div>

            <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapFlyTo position={flyToPosition} />
                {validRestaurants.map((restaurant) => (
                    <Marker
                        icon={greenIcon}
                        key={restaurant.id}
                        position={[restaurant.latitude!, restaurant.longitude!]}
                    >
                        <Popup>
                            <div className="text-center min-w-[150px]">
                                <img
                                    src={restaurant.profilepic || 'https://picsum.photos/seed/default/100/100'}
                                    alt={restaurant.name}
                                    className="w-16 h-16 rounded-full mx-auto mb-2 object-cover"
                                />
                                <h3 className="font-bold text-neutral-900">{restaurant.name}</h3>
                                <p className="text-sm text-neutral-500">{parseCuisines(restaurant.cuisine).join(' · ') || 'Restaurant'}</p>
                                <Button
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => window.location.href = `/restaurant/${restaurant.id}`}
                                >
                                    View Details
                                </Button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
