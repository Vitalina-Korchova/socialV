"use client";
import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useGetMyFollowingsQuery } from "@/store/following/following.api";
import { useCreateChatMutation } from "@/store/chat/chat.api";
import Image from "next/image";
import { Search, UserPlus2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface NewChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectChat: (chatId: number) => void;
}

export function NewChatModal({ isOpen, onClose, onSelectChat }: NewChatModalProps) {
    const { data: followings, isLoading } = useGetMyFollowingsQuery(undefined, {
        skip: !isOpen,
    });
    const [createChat, { isLoading: isCreating }] = useCreateChatMutation();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredFollowings = followings?.users.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectUser = async (userId: number) => {
        try {
            const chat = await createChat(userId).unwrap();
            onSelectChat(chat.id);
            onClose();
        } catch (error) {
            toast.error("Failed to create chat")
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-muted/50 shadow-2xl">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <UserPlus2 className="size-5 text-primary" />
                        New Message
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
                        <Input
                            placeholder="Search followings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-11 bg-muted/30 border-none rounded-xl focus-visible:ring-1 focus-visible:ring-primary/30"
                        />
                    </div>

                    <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar--post pr-2">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                                <Loader2 className="size-6 animate-spin text-primary" />
                                <span className="text-sm font-medium">Loading followings...</span>
                            </div>
                        ) : filteredFollowings && filteredFollowings.length > 0 ? (
                            filteredFollowings.map((user) => (
                                <button
                                    key={user.id}
                                    disabled={isCreating}
                                    onClick={() => handleSelectUser(user.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left",
                                        "hover:bg-primary/5 hover:text-primary active:scale-[0.98] group disabled:opacity-50 disabled:pointer-events-none"
                                    )}
                                >
                                    <div className="relative shrink-0">
                                        <Image
                                            src={user.avatar_url || "/back2.jpg"}
                                            alt={user.username}
                                            width={40}
                                            height={40}
                                            className="w-10 h-10 rounded-full object-cover border border-muted/30 group-hover:border-primary/30 transition-colors"
                                        />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-semibold text-sm truncate">
                                            {user.username}
                                        </span>
                                        <span className="text-[10px] opacity-50 font-medium">
                                            Following
                                        </span>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-10 text-muted-foreground font-medium italic text-sm">
                                No followings found
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
