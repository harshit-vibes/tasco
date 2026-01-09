"use client";

import { useState } from "react";
import { cn } from "../../lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../alert-dialog";
import { MessageSquare, Trash2, Loader2 } from "lucide-react";

export interface Conversation {
  id: string;
  appId: string;
  entityId: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface ChatHistoryProps {
  conversations: Conversation[];
  activeConversationId: string | undefined;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  isLoading?: boolean;
  /** Empty state title */
  emptyTitle?: string;
  /** Empty state subtitle */
  emptySubtitle?: string;
}

export function ChatHistory({
  conversations,
  activeConversationId,
  onSelectConversation,
  onDeleteConversation,
  isLoading = false,
  emptyTitle = "No conversations yet",
  emptySubtitle = "Start a new chat above",
}: ChatHistoryProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="flex h-full flex-col px-3 py-2">
      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto space-y-0.5">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="h-10 w-10 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 flex items-center justify-center mb-3">
              <MessageSquare className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
              {emptyTitle}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-1">
              {emptySubtitle}
            </p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const isActive = activeConversationId === conversation.id;
            const isHovered = hoveredId === conversation.id;

            return (
              <div
                key={conversation.id}
                className={cn(
                  "group flex items-center gap-2.5 w-full rounded-lg px-3 py-2.5 text-sm cursor-pointer transition-all duration-200",
                  isActive
                    ? "bg-white dark:bg-slate-800 shadow-sm border border-slate-200/80 dark:border-slate-700/80"
                    : "hover:bg-white/60 dark:hover:bg-slate-800/60 border border-transparent"
                )}
                onClick={() => onSelectConversation(conversation.id)}
                onMouseEnter={() => setHoveredId(conversation.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200/80 dark:group-hover:bg-slate-700"
                )}>
                  <MessageSquare className="h-3.5 w-3.5" />
                </div>
                <span className={cn(
                  "flex-1 truncate text-left transition-colors duration-200",
                  isActive
                    ? "text-slate-900 dark:text-slate-100 font-medium"
                    : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200"
                )}>
                  {conversation.title}
                </span>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "p-1.5 rounded-md transition-all duration-200",
                        isHovered || isActive
                          ? "opacity-100 hover:bg-red-50 dark:hover:bg-red-950/30"
                          : "opacity-0"
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-red-500 transition-colors" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this conversation and all its messages.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDeleteConversation(conversation.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
