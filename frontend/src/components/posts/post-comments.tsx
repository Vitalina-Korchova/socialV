import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Send, User, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCreateCommentMutation,
  useGetAllCommentsQuery,
  useDeleteCommentMutation,
} from "@/store/comment/comment.api";
import { CommentResponse } from "@/store/comment/comment.type";
import { UserResponse } from "@/store/user/user.type";
import { formatDate } from "@/utils/format";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PostCommentsProps {
  postId: number;
  postAuthorId: number;
  userData: UserResponse | undefined;
}

export default function PostComments({
  postId,
  postAuthorId,
  userData,
}: PostCommentsProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [commentText, setCommentText] = useState("");

  const { data, isLoading, isFetching } = useGetAllCommentsQuery({
    postId,
    page,
    page_size: 10,
  });

  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();

  useEffect(() => {
    if (data?.data) {
      setComments((prev) => {
        if (page === 1) return data.data;
        const newIds = new Set(data.data.map((c) => c.id));
        const filteredPrev = prev.filter((c) => !newIds.has(c.id));
        return [...filteredPrev, ...data.data];
      });
    }
  }, [data, page]);

  // Infinite scroll logic
  const loaderRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loaderRef.current || !data?.has_next_page || isFetching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [data?.has_next_page, isFetching]);

  const handleCreateComment = async () => {
    if (!commentText.trim() || !userData) return;
    try {
      await createComment({
        dto: { text: commentText, post_id: postId },
      }).unwrap();
      setCommentText("");
    } catch (error) {
      toast.error("Failed to create comment");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(commentId).unwrap();
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  return (
    <div className="flex flex-col gap-4 px-5 pb-4 pt-4">
      {/* Input Section */}
      <div className="flex gap-3 items-center">
        <div className="w-10 h-10 relative flex items-center justify-center flex-shrink-0">
          {userData?.border_url && (
            <div className="absolute inset-0 z-10">
              <Image
                src={userData.border_url}
                alt="border"
                width={100}
                height={100}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="size-8 rounded-full bg-muted flex items-center justify-center relative overflow-hidden">
            {userData?.avatar_url ? (
              <Image
                src={userData.avatar_url}
                alt="My Avatar"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>
        <div className="relative w-full">
          <Input
            className="w-full pr-10 focus-visible:ring-[#8A3CFF]/30 focus-visible:ring-2"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleCreateComment();
              }
            }}
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-0 top-0 h-full text-muted-foreground hover:text-primary"
            onClick={handleCreateComment}
            disabled={isCreating || !commentText.trim()}
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Comment List */}
      <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto custom-scrollbar--post">
        {isLoading && page === 1 ? (
          <div className="flex justify-center py-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-2">
            No comments yet.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {comments.map((comment) => (
              <div key={comment.id} className="group flex gap-3">
                <div
                  className="w-10 h-10 relative flex-shrink-0 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => router.push(`/user/${comment.user.id}`)}
                >
                  {comment.user.border_url && (
                    <div className="absolute inset-0 z-10">
                      <Image
                        src={comment.user.border_url}
                        alt="border"
                        width={100}
                        height={100}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="size-8 rounded-full flex-shrink-0 overflow-hidden bg-muted relative flex items-center justify-center">
                    {comment.user.avatar_url ? (
                      <Image
                        src={comment.user.avatar_url}
                        alt={comment.user.username}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-xs">
                        {comment.user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1 bg-muted/30 p-2 rounded-lg w-full relative">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm">
                      {comment.user.username}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </span>
                      {userData &&
                        (userData.id === comment.user.id ||
                          userData.id === postAuthorId) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <Trash2 className="h-3 w-3 " />
                          </Button>
                        )}
                    </div>
                  </div>
                  <p className="text-sm text-foreground break-words whitespace-pre-wrap">
                    {comment.text}
                  </p>
                </div>
              </div>
            ))}

            {data?.has_next_page && (
              <div ref={loaderRef} className="flex justify-center py-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
