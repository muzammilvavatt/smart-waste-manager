





















































































































































































































































































































































































































































































































































































































"use client"

import { useState } from "react"
import { motion, useMotionValue, animate } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { updateUser } from "@/lib/store"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Coins, Gift, Check, ShoppingBag, Coffee } from "lucide-react"
import toast from "react-hot-toast"

interface Reward {
    id: string;
    name: string;
    description: string;
    cost: number;
    icon: React.ReactNode;
    type: 'voucher' | 'product' | 'service';
}

const REWARDS: Reward[] = [
    {
        id: '1',
        name: 'Eco-Store Voucher',
        description: 'Get 10% off on sustainable products at our partner store.',
        cost: 100,
        icon: <ShoppingBag className="h-6 w-6 text-green-600" />,
        type: 'voucher'
    },
    {
        id: '2',
        name: 'Free Coffee',
        description: 'Enjoy a free organic coffee at Green Cafe.',
        cost: 50,
        icon: <Coffee className="h-6 w-6 text-amber-700" />,
        type: 'product'
    },
    {
        id: '3',
        name: 'Donation to Clean Ocean',
        description: 'Donate your points to support ocean cleanup initiatives.',
        cost: 200,
        icon: <Gift className="h-6 w-6 text-blue-500" />,
        type: 'service'
    },
    {
        id: '4',
        name: '$5 Amazon Gift Card',
        description: 'Digital gift card for Amazon purchases.',
        cost: 500,
        icon: <Gift className="h-6 w-6 text-orange-500" />,
        type: 'voucher'
    }
]

export default function RewardsPage() {
    const { user, refetchUser } = useAuth()
    const [redeeming, setRedeeming] = useState<string | null>(null)
    const [rewardToRedeem, setRewardToRedeem] = useState<Reward | null>(null)
    const [activeIndex, setActiveIndex] = useState(0)

    // Carousel calculations
    const DRAG_BUFFER = 50;
    const dragX = useMotionValue(0);

    const onDragEnd = () => {
        const x = dragX.get();

        if (x <= -DRAG_BUFFER && activeIndex < REWARDS.length - 1) {
            setActiveIndex((pv: number) => pv + 1);
        } else if (x >= DRAG_BUFFER && activeIndex > 0) {
            setActiveIndex((pv: number) => pv - 1);
        }
    };

    const handleRedeemClick = (reward: Reward) => {
        if (!user) return
        if ((user.points || 0) < reward.cost) {
            toast.error("Insufficient points to redeem this reward")
            return
        }
        setRewardToRedeem(reward)
    }

    const confirmRedeem = async () => {
        if (!user || !rewardToRedeem) return

        setRedeeming(rewardToRedeem.id)
        try {
            await updateUser(user.id, { points: (user.points || 0) - rewardToRedeem.cost })
            await refetchUser() // Refresh user data to update points UI
            toast.success(`Successfully redeemed "${rewardToRedeem.name}"!`)
            setRewardToRedeem(null)
        } catch (error) {
            console.error("Redemption failed", error)
            toast.error("Failed to redeem reward. Please try again.")
        } finally {
            setRedeeming(null)
        }
    }

    return (
        <div className="space-y-6 sm:space-y-8 pb-24 sm:pb-10 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 border-b border-border/40 pb-4 sm:pb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Rewards Store</h1>
                    <p className="text-[13px] sm:text-base text-muted-foreground mt-1 font-medium">Redeem points for real-world eco-benefits.</p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 px-5 py-3 rounded-[1.25rem] border border-border/60 shadow-sm w-full md:w-auto justify-between md:justify-start">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-500/20 flex items-center justify-center">
                            <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-500" />
                        </div>
                        <span className="font-bold text-sm text-foreground">Available Balance</span>
                    </div>
                    <span className="font-bold text-lg text-yellow-600 dark:text-yellow-500">{user?.points || 0}</span>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl font-bold tracking-tight">Featured Offers</h2>
                    <div className="md:hidden flex items-center gap-1">
                        {REWARDS.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1.5 rounded-full transition-all duration-300 ${activeIndex === idx ? 'w-4 bg-emerald-500' : 'w-1.5 bg-border/60'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Desktop Grid View (Unchanged) */}
                <div className="hidden md:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {REWARDS.map(reward => (
                        <div key={reward.id}>
                            <Card className="flex flex-col h-full rounded-[1.5rem] border-border/50 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                <CardHeader className="p-6 pb-6">
                                    <div className="flex justify-between items-start">
                                        <div className="p-3 bg-secondary/80 rounded-2xl border border-border/40 shadow-sm">
                                            {reward.icon}
                                        </div>
                                        <span className="px-3 py-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 rounded-full uppercase tracking-wider shadow-sm">
                                            {reward.type}
                                        </span>
                                    </div>
                                    <CardTitle className="mt-5 text-xl tracking-tight leading-tight">{reward.name}</CardTitle>
                                    <CardDescription className="text-sm mt-2 font-medium leading-relaxed">{reward.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow p-6 pt-0" />
                                <CardFooter className="p-6 pt-0 mt-auto">
                                    <Button
                                        className="w-full flex justify-between h-12 rounded-xl text-sm font-bold shadow-sm active:scale-[0.98] transition-all group/btn hover:shadow-md"
                                        onClick={() => handleRedeemClick(reward)}
                                        disabled={redeeming === reward.id || (user?.points || 0) < reward.cost}
                                        variant={(user?.points || 0) >= reward.cost ? "default" : "secondary"}
                                    >
                                        {redeeming === reward.id ? (
                                            <div className="flex items-center justify-center w-full">
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redeeming...
                                            </div>
                                        ) : (
                                            <>
                                                <span className="flex-1 text-left">Redeem Offer</span>
                                                <span className="flex items-center gap-1.5 font-bold bg-black/10 dark:bg-white/10 group-hover/btn:bg-black/20 dark:group-hover/btn:bg-white/20 px-2.5 py-1 rounded-lg transition-colors">
                                                    {reward.cost} <Coins className="h-4 w-4" />
                                                </span>
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    ))}
                </div>

                {/* Premium Mobile Swipe Carousel */}
                <div className="md:hidden overflow-hidden relative -mx-4 px-4 pb-4">
                    <motion.div
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.7}
                        dragMomentum={false}
                        style={{ x: dragX }}
                        animate={{ translateX: `-${activeIndex * 100}%` }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        onDragEnd={onDragEnd}
                        className="flex cursor-grab active:cursor-grabbing items-center touch-pan-y"
                    >
                        {REWARDS.map((reward, idx) => {
                            const isActive = activeIndex === idx;
                            return (
                                <motion.div
                                    key={reward.id}
                                    animate={{
                                        scale: isActive ? 1 : 0.92,
                                        opacity: isActive ? 1 : 0.5,
                                    }}
                                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                    className="w-full shrink-0 pr-4"
                                >
                                    <Card className={`flex flex-col h-full rounded-[1.75rem] shadow-lg border relative overflow-hidden transition-colors duration-300 ${isActive ? 'bg-card border-border/60 shadow-emerald-500/5' : 'bg-muted/30 border-transparent shadow-none'}`}>

                                        {/* Decorative Active Glow */}
                                        <div className={`absolute top-0 right-0 h-40 w-40 rounded-full blur-3xl transition-all duration-500 pointer-events-none ${isActive ? 'bg-emerald-500/10' : 'bg-transparent'}`} />

                                        <CardHeader className="p-6">
                                            <div className="flex justify-between items-start">
                                                <motion.div
                                                    initial={false}
                                                    animate={{
                                                        scale: isActive ? 1 : 0.9,
                                                        rotate: isActive ? 0 : -5
                                                    }}
                                                    className={`p-3.5 rounded-2xl border shadow-sm transition-colors ${isActive ? 'bg-secondary/80 border-border/40' : 'bg-background/40 border-transparent'}`}
                                                >
                                                    {reward.icon}
                                                </motion.div>
                                                <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider transition-colors ${isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 shadow-sm' : 'bg-muted text-muted-foreground'}`}>
                                                    {reward.type}
                                                </span>
                                            </div>
                                            <CardTitle className="mt-6 text-[1.35rem] tracking-tight leading-tight">{reward.name}</CardTitle>
                                            <CardDescription className="text-sm mt-2 font-medium leading-relaxed max-w-[90%]">{reward.description}</CardDescription>
                                        </CardHeader>

                                        <CardContent className="flex-grow p-6 pt-0" />

                                        <CardFooter className="p-6 pt-0 pb-6 mt-auto">
                                            <Button
                                                className={`w-full flex justify-between h-14 rounded-xl text-sm font-bold shadow-sm active:scale-[0.97] transition-all group/btn ${isActive ? 'hover:shadow-md' : 'opacity-50 pointer-events-none'}`}
                                                onClick={() => handleRedeemClick(reward)}
                                                disabled={redeeming === reward.id || (user?.points || 0) < reward.cost}
                                                variant={(user?.points || 0) >= reward.cost ? "default" : "secondary"}
                                            >
                                                {redeeming === reward.id ? (
                                                    <div className="flex items-center justify-center w-full min-w-0">
                                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Redeeming...
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="flex-1 text-left truncate min-w-0">Swipe to Redeem</span>
                                                        <span className="flex items-center gap-1.5 font-bold bg-black/10 dark:bg-white/10 px-3 py-1.5 rounded-lg shrink-0">
                                                            {reward.cost} <Coins className="h-4 w-4" />
                                                        </span>
                                                    </>
                                                )}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                </div>
            </div>

            {rewardToRedeem && (
                <Dialog open={!!rewardToRedeem} onOpenChange={(open) => !open && setRewardToRedeem(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Gift className="h-5 w-5 text-indigo-600" /> Confirm Redemption
                            </DialogTitle>
                            <DialogDescription>
                                Are you sure you want to redeem <strong>"{rewardToRedeem.name}"</strong> for <strong>{rewardToRedeem.cost} points</strong>?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="ghost" onClick={() => setRewardToRedeem(null)} disabled={redeeming !== null}>
                                Cancel
                            </Button>
                            <Button className="bg-green-600 hover:bg-green-700" onClick={confirmRedeem} disabled={redeeming !== null}>
                                {redeeming === rewardToRedeem.id ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redeeming...
                                    </>
                                ) : (
                                    'Confirm & Redeem'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
