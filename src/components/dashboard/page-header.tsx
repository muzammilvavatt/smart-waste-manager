import { UserAvatar } from "@/components/shared/user-avatar"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageHeaderProps {
    title: React.ReactNode | string;
    description?: string;
    user: any; // User object from auth context
    onLogout: () => void;
    roleLabel: string;
    actions?: React.ReactNode;
    mobileActions?: React.ReactNode;
}

export function PageHeader({
    title,
    description,
    user,
    onLogout,
    roleLabel,
    actions,
    mobileActions
}: PageHeaderProps) {
    return (
        <div className="mb-6 md:mb-8">
            {/* App-like Header for Mobile */}
            <div className="md:hidden flex flex-col gap-4 pb-4 border-b border-border/40">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <UserAvatar
                            avatarId={user?.profileImage}
                            fallbackName={user?.name || "U"}
                            className="h-11 w-11 rounded-[12px] shadow-sm border border-primary/20"
                            iconClassName="h-5 w-5"
                        />
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground tracking-tight uppercase">
                                {roleLabel}
                            </p>
                            <h1 className="text-lg font-bold tracking-tight text-foreground leading-tight truncate max-w-[150px]">
                                {user?.name?.split(' ')[0] || "User"}
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {mobileActions}
                        <Button variant="ghost" size="icon" onClick={onLogout} className="text-muted-foreground bg-muted/50 rounded-full h-9 w-9 border border-border/50">
                            <LogOut className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                </div>
                {/* Mobile Title context if needed */}
                <div className="flex items-baseline justify-between mt-1">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
                </div>
            </div>

            {/* Traditional Header for Desktop */}
            <div className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-muted-foreground mt-1 text-sm font-medium">
                            {description}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {actions}
                </div>
            </div>
        </div>
    )
}
