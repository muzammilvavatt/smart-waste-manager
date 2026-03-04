"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import "leaflet.heat"
import { CollectionTask } from "@/types"
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, MAP_BOUNDS, MIN_ZOOM } from "@/lib/constants"

// Helper component to add the heat layer
function HeatLayer({ tasks }: { tasks: CollectionTask[] }) {
    const map = useMap()

    useEffect(() => {
        if (!map) return

        // Extract coordinates from tasks that have them
        const points = tasks
            .filter(t => t.coordinates)
            .map(t => [t.coordinates!.lat, t.coordinates!.lng, 1] as [number, number, number])

        // Create the heat layer
        // @ts-ignore - leaflet.heat types might not be perfectly mapped
        const heatLayer = L.heatLayer(points, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            gradient: {
                0.4: 'blue',
                0.6: 'cyan',
                0.7: 'lime',
                0.8: 'yellow',
                1.0: 'red'
            }
        })

        // Safety check to ensure the map container is still valid before adding
        if (map.getContainer()) {
            heatLayer.addTo(map)
        }

        return () => {
            // ensure map exists and we have the layer before attempting remove
            if (map && map.hasLayer(heatLayer)) {
                map.removeLayer(heatLayer)
            }
        }
    }, [map, tasks])

    return null
}

interface DashboardHeatmapProps {
    tasks: CollectionTask[]
}

export default function DashboardHeatmap({ tasks }: DashboardHeatmapProps) {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return <div className="h-[400px] w-full bg-muted/20 animate-pulse flex items-center justify-center rounded-xl">Loading Map...</div>
    }

    // Determine center
    let center: [number, number] = DEFAULT_MAP_CENTER
    if (tasks.length > 0) {
        const firstWithCoords = tasks.find(t => t.coordinates)
        if (firstWithCoords && firstWithCoords.coordinates) {
            center = [firstWithCoords.coordinates.lat, firstWithCoords.coordinates.lng]
        }
    }

    return (
        <MapContainer
            center={center}
            zoom={12} // Slightly zoomed out for a heatmap view
            style={{ height: "100%", width: "100%", zIndex: 0 }}
            maxBounds={MAP_BOUNDS}
            minZoom={MIN_ZOOM}
            className="rounded-xl overflow-hidden"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                className="map-tiles grayscale opacity-80" // Grayscale map helps heatmap colors pop
            />
            <HeatLayer tasks={tasks} />
        </MapContainer>
    )
}
