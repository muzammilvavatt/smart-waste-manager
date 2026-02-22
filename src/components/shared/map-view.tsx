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

interface MapViewProps {
    tasks: CollectionTask[]
    focusedTaskId?: string | null
    onClaimTask?: (taskId: string) => void
    onCompleteTask?: (taskId: string) => void
}

export default function MapView({ tasks, focusedTaskId, onClaimTask, onCompleteTask }: MapViewProps) {
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
            style={{ height: "100%", width: "100%" }}
            maxBounds={MAP_BOUNDS}
            minZoom={MIN_ZOOM}
            maxBoundsViscosity={1.0}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={center} zoom={zoom} />
            <LocationButton />
            {tasks.map(task => (
                task.coordinates && (
                    <Marker
                        key={task.id}
                        position={[task.coordinates.lat, task.coordinates.lng]}
                        icon={icon}
                        eventHandlers={{
                            add: (e) => {
                                if (task.id === focusedTaskId) {
                                    e.target.openPopup()
                                }
                            }
                        }}
                    >
                        <Popup>
                            <div className="p-2 min-w-[150px]">
                                <h3 className="font-bold">{task.wasteType} Waste</h3>
                                <p className="text-sm">{task.amount}</p>
                                <p className="text-xs text-gray-500 mb-2">{task.location}</p>
                                {task.status === 'pending' && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            console.log("Claim Task clicked for:", task.id);
                                            onClaimTask?.(task.id);
                                        }}
                                        className="mt-2 w-full text-xs bg-primary text-primary-foreground px-3 py-2 rounded-md block text-center hover:bg-primary/90 transition-colors font-medium shadow-sm"
                                    >
                                        Claim Task
                                    </button>
                                )}
                                {task.status === 'in-progress' && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            console.log("Complete Task clicked for:", task.id);
                                            onCompleteTask?.(task.id);
                                        }}
                                        className="mt-2 w-full text-xs bg-green-600 text-white px-3 py-2 rounded-md block text-center hover:bg-green-700 transition-colors font-medium shadow-sm"
                                    >
                                        Complete Task
                                    </button>
                                )}
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${task.coordinates.lat},${task.coordinates.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 w-full text-xs bg-secondary text-secondary-foreground px-3 py-2 rounded-md block text-center hover:bg-secondary/80 transition-colors font-medium shadow-sm"
                                >
                                    Get Directions
                                </a>
                            </div>
                        </Popup>
                    </Marker>
                )
            ))}
        </MapContainer>
    )
}
