"use client"

import { useEffect, useState, useMemo } from "react"
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, MAP_BOUNDS, MIN_ZOOM } from "@/lib/constants"

// Fix for default marker icon in Next.js
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
})

interface LocationPickerProps {
    initialLocation?: { lat: number; lng: number } | null
    onLocationSelect: (location: { lat: number; lng: number }) => void
}

function LocationMarker({ position, setPosition, onLocationSelect }: {
    position: L.LatLng | null,
    setPosition: (pos: L.LatLng) => void,
    onLocationSelect: (loc: { lat: number; lng: number }) => void
}) {
    const map = useMap()

    // Allow clicking on map to move marker
    useMapEvents({
        click(e) {
            setPosition(e.latlng)
            onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng })
            map.flyTo(e.latlng, map.getZoom())
        },
    })

    // Update map view when position changes programmatically (e.g. initial load or locate me)
    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom())
        }
    }, [position, map])

    return position === null ? null : (
        <Marker
            position={position}
            icon={icon}
            draggable={true}
            eventHandlers={{
                dragend: (e) => {
                    const marker = e.target
                    const position = marker.getLatLng()
                    setPosition(position)
                    onLocationSelect({ lat: position.lat, lng: position.lng })
                }
            }}
        />
    )
}

function LocateControl({ setPosition, onLocationSelect }: {
    setPosition: (pos: L.LatLng) => void,
    onLocationSelect: (loc: { lat: number; lng: number }) => void
}) {
    const map = useMap()

    const handleLocate = () => {
        map.locate().on("locationfound", function (e) {
            setPosition(e.latlng)
            onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng })
            map.flyTo(e.latlng, 16)
        })
    }

    return (
        <div className="leaflet-bottom leaflet-right">
            <div className="leaflet-control leaflet-bar">
                <a
                    href="#"
                    className="leaflet-control-zoom-in"
                    title="Locate me"
                    role="button"
                    onClick={(e) => {
                        e.preventDefault()
                        handleLocate()
                    }}
                    style={{
                        width: '30px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'white',
                        cursor: 'pointer'
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="2" x2="12" y2="22" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                    </svg>
                </a>
            </div>
        </div>
    )
}

export default function LocationPicker({ initialLocation, onLocationSelect }: LocationPickerProps) {
    const [position, setPosition] = useState<L.LatLng | null>(
        initialLocation ? new L.LatLng(initialLocation.lat, initialLocation.lng) : null
    )

    // Sync internal state if prop changes
    useEffect(() => {
        if (initialLocation) {
            setPosition(new L.LatLng(initialLocation.lat, initialLocation.lng))
        }
    }, [initialLocation])

    const defaultCenter: [number, number] = DEFAULT_MAP_CENTER

    return (
        <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative z-0">
            <MapContainer
                center={initialLocation ? [initialLocation.lat, initialLocation.lng] : defaultCenter}
                zoom={DEFAULT_MAP_ZOOM}
                style={{ height: "100%", width: "100%" }}
                maxBounds={MAP_BOUNDS}
                minZoom={MIN_ZOOM}
                maxBoundsViscosity={1.0}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker
                    position={position}
                    setPosition={setPosition}
                    onLocationSelect={onLocationSelect}
                />
                <LocateControl
                    setPosition={setPosition}
                    onLocationSelect={onLocationSelect}
                />
            </MapContainer>

            {!position && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/75 text-white text-xs px-3 py-1 rounded-full pointer-events-none z-[1000]">
                    Click map to select location
                </div>
            )}
        </div>
    )
}
