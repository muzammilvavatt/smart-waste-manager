"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { CollectionTask } from "@/types"
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, MAP_BOUNDS, MIN_ZOOM } from "@/lib/constants"
import L from "leaflet"

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

// Helper component to handle map movement
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap()
    useEffect(() => {
        map.setView(center, zoom)
    }, [center, zoom, map])
    return null
}

function LocationButton() {
    const map = useMap()

    const handleLocate = () => {
        map.locate().on("locationfound", function (e) {
            map.flyTo(e.latlng, map.getZoom())
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
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        color: 'black'
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

interface MapViewProps {
    tasks: CollectionTask[]
    focusedTaskId?: string | null
    userLocation?: [number, number] | null
    onClaimTask?: (taskId: string) => void
    onCompleteTask?: (taskId: string) => void
}

export default function MapView({ tasks, focusedTaskId, onClaimTask, onCompleteTask, userLocation }: MapViewProps) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return <div className="h-full w-full bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center">Loading Map...</div>
    }

    // Default center (can be adjusted or dynamic based on user)
    const defaultCenter: [number, number] = DEFAULT_MAP_CENTER

    // Determine center and zoom based on focus
    let center = defaultCenter
    let zoom = DEFAULT_MAP_ZOOM

    const focusedTask = tasks.find(t => t.id === focusedTaskId)
    if (focusedTask && focusedTask.coordinates) {
        center = [focusedTask.coordinates.lat, focusedTask.coordinates.lng]
        zoom = 16
    } else if (tasks.length > 0) {
        // Use first task with coordinates as fallback center
        const firstWithCoords = tasks.find(t => t.coordinates)
        if (firstWithCoords && firstWithCoords.coordinates) {
            center = [firstWithCoords.coordinates.lat, firstWithCoords.coordinates.lng]
        }
    }

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            style={{ height: "100%", width: "100%", zIndex: 0 }}
            maxBounds={MAP_BOUNDS}
            minZoom={MIN_ZOOM}
            maxBoundsViscosity={1.0}
            className="rounded-xl border border-border/50 shadow-inner overflow-hidden"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                className="map-tiles"
            />
            <MapUpdater center={center} zoom={zoom} />
            <LocationButton />
            
            {userLocation && (
                <Marker
                    position={userLocation}
                    icon={L.divIcon({
                        className: 'user-location-marker',
                        html: '<div class="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg -translate-x-1/2 -translate-y-1/2"><div class="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-75"></div></div>',
                        iconSize: [0, 0],
                        iconAnchor: [0, 0]
                    })}
                />
            )}

            {tasks.map(task => (
                task.coordinates && (
                    <Marker
                        key={task.id}
                        position={[task.coordinates.lat, task.coordinates.lng]}
                        icon={icon}
                        opacity={0.8}
                        eventHandlers={{
                            add: (e) => {
                                if (task.id === focusedTaskId) {
                                    e.target.openPopup()
                                }
                            }
                        }}
                    >
                        <Popup className="premium-popup">
                            <div className="p-1 min-w-[200px]">
                                <h3 className="font-bold text-base capitalize text-gray-900 tracking-tight mb-0.5">{task.wasteType} Waste</h3>
                                <div className="inline-block bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded text-xs mb-2 border border-gray-200 shadow-sm">
                                    {task.amount}
                                </div>
                                <p className="text-xs text-gray-500 font-medium leading-tight mb-3 flex items-start gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 shrink-0 mt-0.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                    {task.location}
                                </p>

                                <div className="flex flex-col gap-1.5 pt-2 border-t border-gray-100">
                                    {task.status === 'pending' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                onClaimTask?.(task.id);
                                            }}
                                            className="w-full text-xs bg-emerald-600 text-white px-3 py-2 rounded-md font-bold shadow-sm hover:bg-emerald-700 transition-colors"
                                        >
                                            Claim Task
                                        </button>
                                    )}
                                    {task.status === 'in-progress' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                onCompleteTask?.(task.id);
                                            }}
                                            className="w-full text-xs bg-blue-600 text-white px-3 py-2 rounded-md font-bold shadow-sm hover:bg-blue-700 transition-colors"
                                        >
                                            Verify Collection
                                        </button>
                                    )}
                                    <a
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${task.coordinates.lat},${task.coordinates.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full text-xs bg-gray-100 text-gray-700 border border-gray-200 px-3 py-2 rounded-md font-semibold text-center hover:bg-gray-200 transition-colors shadow-sm"
                                    >
                                        Get Directions
                                    </a>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                )
            ))}
        </MapContainer>
    )
}
