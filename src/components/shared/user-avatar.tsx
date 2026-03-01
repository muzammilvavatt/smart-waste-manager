"use client"

import { User, Sprout, Cat, Shield, Leaf, Flame, Sparkles, Bird, Star, Crown } from "lucide-react"

export const PREBUILT_AVATARS = [
    {
        id: "avatar-1",
        Icon: Sprout,
        bgFrom: "from-emerald-400",
        bgTo: "to-teal-600",
        iconColor: "text-white",
        label: "Green Sprout",
    },
    {
        id: "avatar-2",
        Icon: Shield,
        bgFrom: "from-indigo-400",
        bgTo: "to-blue-600",
        iconColor: "text-white",
        label: "Secure Shield",
    },
    {
        id: "avatar-3",
        Icon: Flame,
        bgFrom: "from-orange-400",
        bgTo: "to-red-500",
        iconColor: "text-white",
        label: "Flame",
    },
    {
        id: "avatar-4",
        Icon: Leaf,
        bgFrom: "from-green-400",
        bgTo: "to-emerald-500",
        iconColor: "text-white",
        label: "Nature Leaf",
    },
    {
        id: "avatar-5",
        Icon: Sparkles,
        bgFrom: "from-purple-400",
        bgTo: "to-pink-600",
        iconColor: "text-white",
        label: "Sparkles",
    },
    {
        id: "avatar-6",
        Icon: Bird,
        bgFrom: "from-sky-400",
        bgTo: "to-indigo-500",
        iconColor: "text-white",
        label: "Sky Bird",
    },
    {
        id: "avatar-7",
        Icon: Star,
        bgFrom: "from-yellow-400",
        bgTo: "to-amber-500",
        iconColor: "text-white",
        label: "Star",
    },
    {
        id: "avatar-8",
        Icon: Crown,
        bgFrom: "from-zinc-700",
        bgTo: "to-black",
        iconColor: "text-yellow-400",
        label: "Dark Crown",
    },
]

interface UserAvatarProps {
    avatarId?: string | null
    fallbackName: string
    className?: string
    iconClassName?: string
}

export function UserAvatar({ avatarId, fallbackName, className = "", iconClassName = "" }: UserAvatarProps) {
    // Check if the avatarId is a custom image URL, local path, or base64 string
    if (avatarId && (avatarId.startsWith("http") || avatarId.startsWith("/") || avatarId.startsWith("data:image"))) {
        return (
            <div className={`flex items-center justify-center rounded-full bg-muted shadow-sm shrink-0 overflow-hidden ${className}`}>
                <img src={avatarId} alt={fallbackName || "User Avatar"} className="h-full w-full object-cover" />
            </div>
        )
    }

    const avatar = PREBUILT_AVATARS.find((a) => a.id === avatarId)

    if (avatar) {
        const { Icon, bgFrom, bgTo, iconColor } = avatar
        return (
            <div className={`flex items-center justify-center rounded-full bg-gradient-to-br ${bgFrom} ${bgTo} shadow-sm shrink-0 overflow-hidden ${className}`}>
                <Icon className={`${iconColor} ${iconClassName}`} />
            </div>
        )
    }

    // Fallback initials
    return (
        <div className={`flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold shrink-0 ${className}`}>
            {fallbackName ? fallbackName.charAt(0).toUpperCase() : "U"}
        </div>
    )
}
