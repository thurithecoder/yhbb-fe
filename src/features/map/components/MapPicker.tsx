import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, X, MapPin } from 'lucide-react';

// Fix marker icon issue in Leaflet
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

interface MapPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (address: string, lat: number, lng: number) => void;
    initialLat?: number;
    initialLng?: number;
    initialAddress?: string;
}

export default function MapPicker({ isOpen, onClose, onSelect, initialLat, initialLng, initialAddress }: MapPickerProps) {
    const defaultLat = 3.139;
    const defaultLng = 101.6869;

    const [position, setPosition] = useState<[number, number]>([
        initialLat || defaultLat,
        initialLng || defaultLng
    ]);
    const [address, setAddress] = useState(initialAddress || '');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isReversing, setIsReversing] = useState(false);

    const reverseGeocode = async (lat: number, lng: number) => {
        setIsReversing(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&countrycodes=my`
            );
            const data = await res.json();
            if (data.display_name) {
                setAddress(data.display_name);
            } else {
                setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            }
        } catch (error) {
            console.error('Reverse geocode error:', error);
            setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        } finally {
            setIsReversing(false);
        }
    };

    const searchLocation = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}, Malaysia&format=json&limit=5&countrycodes=my&addressdetails=1`
            );
            const data = await res.json();

            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const newLat = parseFloat(lat);
                const newLng = parseFloat(lon);
                setPosition([newLat, newLng]);
                setAddress(display_name);
                setSearchQuery('');
            } else {
                alert('Location not found in Malaysia. Please try a different search term.');
            }
        } catch (error) {
            console.error('Search error:', error);
            alert('Error searching for location');
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            setPosition([initialLat || defaultLat, initialLng || defaultLng]);
            if (initialAddress) {
                setAddress(initialAddress);
            } else if (initialLat && initialLng) {
                reverseGeocode(initialLat, initialLng);
            } else {
                setAddress('');
            }
        }
    }, [isOpen, initialLat, initialLng, initialAddress]);

    const LocationMarker = () => {
        const map = useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setPosition([lat, lng]);
                reverseGeocode(lat, lng);
                map.flyTo([lat, lng], map.getZoom());
            },
        });

        return (
            <Marker
                position={position}
                draggable={true}
                icon={greenIcon}
                eventHandlers={{
                    dragend: (e) => {
                        const latlng = e.target.getLatLng();
                        setPosition([latlng.lat, latlng.lng]);
                        reverseGeocode(latlng.lat, latlng.lng);
                    }
                }}
            />
        );
    };

    const handleConfirm = () => {
        if (!address) {
            alert('Please select a location on the map first');
            return;
        }
        onSelect(address, position[0], position[1]);
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    // Component to control map view
    const MapController = () => {
        const map = useMapEvents({});
        useEffect(() => {
            map.flyTo(position, map.getZoom());
        }, [position, map]);
        return null;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
            <DialogContent className="w-[95vw] max-w-[95vw] h-[90vh] p-0 rounded-2xl flex flex-col md:w-[90vw] md:max-w-[900px] md:h-[85vh]">
                {/* Header */}
                <DialogHeader className="p-4 pb-2 border-b border-neutral-100 md:p-6">
                    <DialogTitle className="text-xl font-black uppercase tracking-tight md:text-2xl flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-[#ffcf1c]" />
                        Select Restaurant Location
                    </DialogTitle>
                </DialogHeader>

                {/* Content */}
                <div className="flex-1 flex flex-col p-4 pt-2 gap-3 overflow-y-auto md:p-6 md:gap-4">
                    {/* Search Bar - Always Visible */}
                    <div className="bg-white rounded-xl border border-neutral-200 p-2 shadow-sm">
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                <Input
                                    placeholder="Search location in Malaysia (e.g., KLCC, Bukit Bintang)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                                    className="pl-9 h-10 text-sm"
                                />
                            </div>
                            <Button
                                onClick={searchLocation}
                                disabled={isSearching}
                                className="bg-[#ffcf1c] hover:bg-[#070605] whitespace-nowrap h-10 text-sm px-4"
                            >
                                {isSearching ? '...' : 'Search'}
                            </Button>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1.5 px-1">
                            Search for restaurants, streets, or landmarks in Malaysia
                        </p>
                    </div>

                    {/* Map Container */}
                    <div className="relative h-[280px] rounded-xl overflow-hidden border border-neutral-200 md:h-[400px]">
                        <MapContainer
                            center={position}
                            zoom={15}
                            style={{ height: '100%', width: '100%' }}
                            zoomControl={true}
                            className="z-0"
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <LocationMarker />
                            <MapController />
                        </MapContainer>

                        {/* Instructions */}
                        <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-md rounded-lg p-2">
                            <p className="text-white text-xs text-center">
                                👆 Tap on map or drag 📍 marker to select location
                            </p>
                        </div>
                    </div>

                    {/* Selected Address */}
                    <div className="bg-[#FFF9DC] p-3 rounded-xl">
                        <p className="text-xs font-black uppercase tracking-wider text-neutral-500 mb-1">
                            Selected Location
                            {isReversing && <span className="ml-2 text-neutral-400">(Loading...)</span>}
                        </p>
                        <p className="text-xs text-neutral-800 font-medium break-words md:text-sm">
                            {address || 'Tap on the map or drag the marker to select a location'}
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            className="flex-1 rounded-xl font-bold h-11 text-sm md:h-12 md:text-base"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            className="flex-1 bg-[#ffcf1c] hover:bg-[#070605] rounded-xl font-bold h-11 text-sm md:h-12 md:text-base"
                        >
                            Confirm Location
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
