"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function ThemeToggle({ variant = "button" }: { variant?: "button" | "switch" }) {
    const [theme, setTheme] = React.useState<"light" | "dark">("light")
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
        const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
        if (savedTheme) {
            setTheme(savedTheme)
            document.documentElement.classList.toggle("dark", savedTheme === "dark")
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            setTheme("dark")
            document.documentElement.classList.add("dark")
        }
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light"
        setTheme(newTheme)
        localStorage.setItem("theme", newTheme)
        document.documentElement.classList.toggle("dark", newTheme === "dark")
    }

    if (!mounted) {
        return variant === "button" ? (
            <Button variant="ghost" size="icon" title="Toggle Theme" disabled>
                <Sun className="h-[1.2rem] w-[1.2rem]" />
            </Button>
        ) : (
            <div className="flex items-center space-x-2">
                <Switch disabled checked={false} />
            </div>
        )
    }

    if (variant === "switch") {
        return (
            <div className="flex items-center space-x-2">
                <Switch
                    checked={theme === "dark"}
                    onCheckedChange={() => toggleTheme()}
                    aria-label="Toggle Dark Mode"
                />
            </div>
        )
    }

    return (
        <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle Theme">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
    )
}
