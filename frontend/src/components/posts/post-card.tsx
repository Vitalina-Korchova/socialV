"use client";
import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, Repeat, SquarePen, Trash2 } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { formatDate } from "@/utils/format";
import { IoIosHeart, IoIosHeartEmpty } from "react-icons/io";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { motion } from "framer-motion";
import { TbUserStar } from "react-icons/tb";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { PostResponse } from "@/store/post/post.type";
import PostComments from "./post-comments";
import { UserBadgesList } from "../ui/user-badge";
import { FormattedText } from "../ui/formatted-text";
import { toast } from "sonner";
import {
  useLikePostMutation,
  useRepostPostMutation,
  useSavePostMutation,
} from "@/store/post/post.api";
import { useRouter } from "next/navigation";

const MAX_LINES = 4;

interface PostCardProps {
  post: PostResponse;
  userData: any;
  type: string;
  onDelete: (id: number, text: string) => void;
  onUpdate: (id: number) => void;
  onImageClick: (url: string) => void;
  onSaveToggle?: (id: number, isSaved: boolean) => void;
  postsLoading: boolean;
}

export const PostCard = React.memo(({
  post,
  userData,
  type,
  onDelete,
  onUpdate,
  onImageClick,
  onSaveToggle,
  postsLoading,
}: PostCardProps) => {
  const router = useRouter();
  const [likePost] = useLikePostMutation();
  const [repostPost] = useRepostPostMutation();
  const [savePost] = useSavePostMutation();

  const [isLiked, setIsLiked] = useState(post.isLikedByMe);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [isReposted, setIsReposted] = useState(post.isRepostedByMe);
  const [isSaved, setIsSaved] = useState(post.isSavedByMe);
  const [expanded, setExpanded] = useState(false);
  const [isExpandable, setIsExpandable] = useState(false);
  const [commentInputVisible, setCommentInputVisible] = useState(false);
  
  const textRef = useRef<HTMLParagraphElement>(null);

  const measureLines = () => {
    if (!textRef.current) return;
    const el = textRef.current;
    const styles = window.getComputedStyle(el);
    const lineHeight = parseFloat(styles.lineHeight);
    const lines = Math.round(el.scrollHeight / lineHeight);
    setIsExpandable(lines > MAX_LINES);
  };

  useEffect(() => {
    measureLines();
    const observer = new ResizeObserver(() => measureLines());
    if (textRef.current) {
        observer.observe(textRef.current);
    }
    return () => observer.disconnect();
  }, [post.text_content]);

  const handleLike = async () => {
    try {
      const originalLiked = isLiked;
      const originalCount = likesCount;
      
      // Optimistic update
      setIsLiked(!originalLiked);
      setLikesCount(originalLiked ? originalCount - 1 : originalCount + 1);
      
      await likePost({ postId: post.id }).unwrap();
    } catch (error) {
      // Rollback
      setIsLiked(post.isLikedByMe);
      setLikesCount(post.likes);
      toast.error("Error occurred while liking post");
    }
  };

  const handleRepost = async () => {
    try {
      const originalReposted = isReposted;
      setIsReposted(!originalReposted);
      await repostPost({ postId: post.id }).unwrap();
    } catch (error) {
      setIsReposted(post.isRepostedByMe);
      toast.error("Error occurred while reposting post");
    }
  };

  const handleSave = async () => {
    try {
      const res = await savePost({ postId: post.id }).unwrap();
      setIsSaved(res.saved_post);
      if (onSaveToggle) {
        onSaveToggle(post.id, res.saved_post);
      }
    } catch (error) {
      toast.error("Error occurred while saving post");
    }
  };

  return (
    <Card className="w-[330px] sm:w-auto sm:max-w-md lg:max-w-xl mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300 gap-3! break-inside-avoid">
      <CardHeader className="pb-3 px-2 sm:px-6">
        <div className="flex items-top justify-between">
          <div className="flex items-top space-x-2">
            <div className="px-2">
              <div
                className={`w-10 h-10 relative flex items-center justify-center ${
                  type === "all" || type === "saved" ? "cursor-pointer" : ""
                }`}
                onClick={
                  type === "all" || type === "saved"
                    ? () => {
                        if (post.user.id === userData?.id) {
                          router.push("/profile?tab=my-posts");
                        } else {
                          router.push(`/user/${post.user.id}`);
                        }
                      }
                    : undefined
                }
              >
                {post.user?.border_url && (
                  <div className="absolute inset-0 overflow-hidden z-10">
                    <Image
                      src={post.user.border_url}
                      alt="animated border"
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                      priority
                      unoptimized
                    />
                  </div>
                )}
                {postsLoading ? (
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                    <TbUserStar className="w-5 h-5 text-primary" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                    {post.user?.avatar_url && (
                      <Image
                        src={post.user.avatar_url}
                        alt="avatar"
                        width={300}
                        height={300}
                        className="rounded-full object-cover"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg">{post.user.username}</h3>
              <UserBadgesList
                badges={post.user.badges}
                itemClassName="text-[7px] sm:text-[8px]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 justify-top items-top">
            {type === "mine" && (
              <div className="flex flex-row gap-3 items-center md:justify-center">
                <div
                  className="text-primary cursor-pointer hover:text-primary/60"
                  onClick={() => onUpdate(post.id)}
                >
                  <SquarePen className="w-5 h-5" />
                </div>
                <div
                  className="text-primary cursor-pointer hover:text-primary/60"
                  onClick={() => onDelete(post.id, post.text_content)}
                >
                  <Trash2 className="w-5 h-5" />
                </div>
              </div>
            )}
            <span className="text-[10px] sm:text-sm text-muted-foreground">
              {formatDate(post.created_at)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <p
          ref={textRef}
          className={`text-sm text-muted-foreground leading-relaxed mb-2 whitespace-pre-wrap break-words ${
            expanded ? "" : "line-clamp-4"
          }`}
        >
          <FormattedText text={post.text_content} />
        </p>
        {isExpandable && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-primary hover:underline cursor-pointer"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}

        {post.images && post.images.length === 1 && (
          <div className="relative overflow-hidden rounded-lg">
            <Image
              src={post.images[0].url}
              width={500}
              height={300}
              alt="Post image"
              onClick={() => onImageClick(post.images[0].url)}
              className="w-full h-80 object-cover cursor-pointer"
            />
          </div>
        )}

        {post.images && post.images.length > 1 && (
          <div className="relative overflow-hidden rounded-lg">
            <Carousel className="w-full">
              <CarouselContent>
                {post.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <Image
                      src={image.url}
                      width={500}
                      height={300}
                      alt={`Post image ${index + 1}`}
                      onClick={() => onImageClick(image.url)}
                      className="w-full h-80 object-cover cursor-pointer"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="!left-2 !top-1/2 !-translate-y-1/2 bg-black/60! text-white shadow-lg cursor-pointer" />
              <CarouselNext className="!right-2 !top-1/2 !-translate-y-1/2 bg-black/60! text-white shadow-lg cursor-pointer" />
            </Carousel>
          </div>
        )}
      </CardContent>

      {post.repostedByUsers && post.repostedByUsers.length > 1 && (
        <div className="px-5 pb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex -space-x-2">
            {post.repostedByUsers.slice(0, 2).map((user, idx) => (
              <div
                key={idx}
                className="h-6 w-6 relative flex items-center justify-center"
              >
                {user.border_url && (
                  <div className="absolute inset-0 overflow-hidden z-10">
                    <Image
                      src={user.border_url}
                      alt="border"
                      width={50}
                      height={50}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center border border-background relative overflow-hidden">
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt="avatar"
                      width={100}
                      height={100}
                      className="rounded-full object-cover w-full h-full"
                    />
                  ) : (
                    <TbUserStar className="text-primary size-3" />
                  )}
                </div>
              </div>
            ))}
            {post.repostedByUsers.length > 2 && (
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center border border-background text-[10px] relative z-10">
                +{post.repostedByUsers.length - 2}
              </div>
            )}
          </div>
          <span>
            Reposted by{" "}
            <span className="text-foreground font-medium">
              {post.repostedByUsers[0].username}
            </span>{" "}
            and others
          </span>
        </div>
      )}

      <CardFooter className="pt-4 flex justify-between items-center border-t">
        <div className="flex gap-3">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="text-muted-foreground flex flex-row gap-1 items-end justify-end cursor-pointer"
            onClick={handleLike}
          >
            <div>
              {isLiked ? (
                <IoIosHeart className="h-5 w-5 text-primary" />
              ) : (
                <IoIosHeartEmpty className="h-5 w-5" />
              )}
            </div>
            <span className="text-xs">{likesCount || 0}</span>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRepost}
          >
            <div className="text-muted-foreground flex flex-row gap-1 items-end justify-end cursor-pointer">
              {isReposted ? (
                <Repeat className="h-5 w-5 text-primary" />
              ) : (
                <Repeat className="h-5 w-5" />
              )}
            </div>
          </motion.button>
        </div>
        <div className="flex gap-3">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => setCommentInputVisible(!commentInputVisible)}
          >
            <MessageCircle className="text-muted-foreground h-4 w-4" />
            <label className="text-sm font-medium text-muted-foreground cursor-pointer">
              {post.comments_count || 0}
            </label>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
          >
            <div className="text-muted-foreground flex flex-row gap-1 items-end justify-end cursor-pointer">
              {isSaved ? (
                <FaBookmark className="h-5 w-5 text-primary" />
              ) : (
                <FaRegBookmark className="h-5 w-5" />
              )}
            </div>
          </motion.button>
        </div>
      </CardFooter>

      {commentInputVisible && (
        <PostComments
          postId={post.id}
          userData={userData}
          postAuthorId={post.user.id}
        />
      )}
    </Card>
  );
});

PostCard.displayName = "PostCard";
