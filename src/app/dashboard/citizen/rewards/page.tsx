"use client"

import { useState } from "react"
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
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Rewards</h1>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">Redeem your hard-earned points for exciting rewards.</p>
                </div>
                <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full border border-yellow-200 shadow-sm w-full md:w-auto justify-center md:justify-start">
                    <Coins className="h-5 w-5 text-yellow-600" />
                    <span className="font-bold text-lg text-yellow-800">{user?.points || 0} Points Available</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {REWARDS.map(reward => (
                    <Card key={reward.id} className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="p-3 bg-gray-100 rounded-lg dark:bg-gray-800">
                                    {reward.icon}
                                </div>
                                <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full uppercase tracking-wide">
                                    {reward.type}
                                </span>
                            </div>
                            <CardTitle className="mt-4">{reward.name}</CardTitle>
                            <CardDescription>{reward.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            {/* Spacer */}
                        </CardContent>
                        <CardFooter className="pt-0">
                            <Button
                                className="w-full flex justify-between group"
                                onClick={() => handleRedeemClick(reward)}
                                disabled={redeeming === reward.id || (user?.points || 0) < reward.cost}
                                variant={(user?.points || 0) >= reward.cost ? "default" : "secondary"}
                            >
                                {redeeming === reward.id ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redeeming...
                                    </>
                                ) : (
                                    <>
                                        <span>Redeem</span>
                                        <span className="flex items-center gap-1 font-bold group-hover:scale-110 transition-transform">
                                            {reward.cost} <Coins className="h-3.5 w-3.5" />
                                        </span>
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

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
