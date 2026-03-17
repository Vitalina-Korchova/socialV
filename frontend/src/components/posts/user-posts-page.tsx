"use client";
import React, { useEffect, useRef, useState } from "react";

import { MessageCircle, Repeat, User } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { useGetMeQuery } from "@/store/user/user.api";
import {
  useGetPostByUserIdQuery,
  useLikePostMutation,
  useRepostPostMutation,
  useSavePostMutation,
} from "@/store/post/post.api";
import PostComments from "./post-comments";
import { Loader } from "../ui/loader";
import { ErrorState } from "../ui/error";
import { formatDate } from "@/utils/format";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { toast } from "sonner";
import { IoIosHeart, IoIosHeartEmpty } from "react-icons/io";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { TbUserStar } from "react-icons/tb";
import { UserBadgesList } from "../ui/user-badge";
import { FormattedText } from "../ui/formatted-text";

const MAX_LINES = 4;

export default function UserPostsPage({ id }: { id: number }) {
  const [page, setPage] = useState(1);

  const {
    data: postsData,
    error: postsError,
    isLoading: postsLoading,
  } = useGetPostByUserIdQuery({
    userId: id,
    page: page,
    page_size: 200, //HardCode
  });

  const { data: userData } = useGetMeQuery();

  const [likePost] = useLikePostMutation();
  const [repostPost] = useRepostPostMutation();
  const [savePost] = useSavePostMutation();

  const [isExpandable, setIsExpandable] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});
  const textRefs = useRef<{ [key: number]: HTMLParagraphElement | null }>({});
  const [openImage, setOpenImage] = useState<string | null>(null);
  const [isLikedPost, setIsLikedPost] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [countLikes, setCountLikes] = useState<{ [key: number]: number }>({});
  const [isRepostPost, setIsRepostPost] = useState<{
    [key: number]: boolean;
  }>({});
  const [isSavedPost, setIsSavedPost] = useState<{ [key: number]: boolean }>(
    {}
  );

  useEffect(() => {
    if (!postsData?.data) return;

    const likedMap: { [key: number]: boolean } = {};
    const likesCountMap: { [key: number]: number } = {};
    const repostMap: { [key: number]: boolean } = {};
    const savedMap: { [key: number]: boolean } = {};

    postsData.data.forEach((post) => {
      likedMap[post.id] = post.isLikedByMe;
      likesCountMap[post.id] = post.likes;
      repostMap[post.id] = post.isRepostedByMe;
      savedMap[post.id] = post.isSavedByMe;
    });

    setIsLikedPost(likedMap);
    setCountLikes(likesCountMap);
    setIsRepostPost(repostMap);
    setIsSavedPost(savedMap);
  }, [postsData]);

  const [commentInputVisible, setCommentInputVisible] = useState<{
    [key: number]: boolean;
  }>({});

  const toggleCommentInput = (postId: number) => {
    setCommentInputVisible((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const measureLines = (postId: number) => {
    const el = textRefs.current[postId];
    if (!el) return;

    const styles = window.getComputedStyle(el);
    const lineHeight = parseFloat(styles.lineHeight);

    const lines = Math.round(el.scrollHeight / lineHeight);

    setIsExpandable((prev) => ({
      ...prev,
      [postId]: lines > MAX_LINES,
    }));
  };

  useEffect(() => {
    postsData?.data.forEach((post) => {
      measureLines(post.id);
    });
  }, [postsData]);

  useEffect(() => {
    const handleResize = () => {
      postsData?.data.forEach((post) => {
        measureLines(post.id);
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [postsData]);

  const handleLikePost = async (postId: number) => {
    try {
      await likePost({ postId }).unwrap();
      const currentLikeStatus = isLikedPost[postId];
      const currentLikesCount = countLikes[postId] || 0;

      setIsLikedPost((prev) => ({
        ...prev,
        [postId]: !currentLikeStatus,
      }));

      setCountLikes((prev) => ({
        ...prev,
        [postId]: currentLikeStatus
          ? currentLikesCount - 1
          : currentLikesCount + 1,
      }));
    } catch (error) {
      toast.error("Error occurred while liking post");
    }
  };

  const handleRepost = async (postId: number) => {
    try {
      await repostPost({ postId }).unwrap();
      const currentRepostStatus = isRepostPost[postId];
      setIsRepostPost((prev) => ({
        ...prev,
        [postId]: !currentRepostStatus,
      }));
    } catch (error) {
      toast.error("Error occurred while reposting post");
    }
  };

  const handleSavePost = async (postId: number) => {
    try {
      await savePost({ postId }).unwrap();
      const currentSaveStatus = isSavedPost[postId];
      setIsSavedPost((prev) => ({
        ...prev,
        [postId]: !currentSaveStatus,
      }));
    } catch (error) {
      toast.error("Error occurred while saving post");
    }
  };

  return (
    <>
      <div className="flex flex-col gap-7">
        {postsLoading && <Loader />}
        {postsError && <ErrorState />}
        {postsData?.data.length === 0 && (
          <p className="text-base text-foreground p-5 text-center">No posts</p>
        )}
        <div className="columns-2 gap-5 space-y-5">
          {!postsLoading &&
            !postsError &&
            postsData?.data.map((post) => (
              <Card
                key={post.id}
                className="w-[330px] sm:w-auto sm:max-w-md lg:max-w-xl mx-auto shadow-lg hover:shadow-xl
           transition-shadow duration-300 gap-3! break-inside-avoid"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 relative flex items-center justify-center">
                        {post.user?.border_url && (
                          <div className="absolute inset-0 overflow-hidden z-10">
                            <Image
                              src={post.user.border_url}
                              alt="animated border"
                              width={100}
                              height={100}
                              className="w-full h-full object-cover "
                              priority
                            />
                          </div>
                        )}
                        {postsLoading ? (
                          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center relative">
                            <TbUserStar className="w-5 h-5 text-primary" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center relative overflow-hidden">
                            {post.user?.avatar_url ? (
                              <Image
                                src={post.user.avatar_url}
                                alt="avatar"
                                width={300}
                                height={300}
                                className="rounded-full object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full bg-black flex items-center justify-center">
                                <TbUserStar className="w-5 h-5 text-primary" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg">
                          {post.user.username || "Username"}
                        </h3>
                        <UserBadgesList badges={post.user.badges} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 justify-end items-end">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pb-4">
                  <p
                    ref={(el) => {
                      textRefs.current[post.id] = el;
                    }}
                    className={`text-sm text-muted-foreground leading-relaxed mb-2 whitespace-pre-wrap break-words ${expanded[post.id] ? "" : "line-clamp-4"
                      }`}
                  >
                    <FormattedText text={post.text_content} />
                  </p>
                  {isExpandable[post.id] && (
                    <button
                      onClick={() =>
                        setExpanded((prev) => ({
                          ...prev,
                          [post.id]: !prev[post.id],
                        }))
                      }
                      className="text-sm text-primary hover:underline cursor-pointer"
                    >
                      {expanded[post.id] ? "Show less" : "Show more"}
                    </button>
                  )}

                  {post.images && post.images.length === 1 && (
                    <div className="relative overflow-hidden rounded-lg">
                      <Image
                        src={post.images[0].url}
                        width={500}
                        height={300}
                        alt="Post image"
                        onClick={() => setOpenImage(post.images[0].url)}
                        className="w-full h-80 object-cover cursor-pointer"
                      />
                    </div>
                  )}

                  {post.images && post.images.length > 1 && (
                    <div className="relative overflow-hidden rounded-lg ">
                      <Carousel className="w-full">
                        <CarouselContent>
                          {post.images.map((image, index) => (
                            <CarouselItem key={index}>
                              <Image
                                src={image.url}
                                width={500}
                                height={300}
                                alt={`Post image ${index + 1}`}
                                onClick={() => setOpenImage(image.url)}
                                className="w-full h-80 object-cover cursor-pointer"
                              />
                            </CarouselItem>
                          ))}
                        </CarouselContent>

                        {post.images.length > 1 && (
                          <>
                            <CarouselPrevious className="!left-2 !top-1/2 !-translate-y-1/2 bg-black/60! text-white shadow-lg cursor-pointer" />
                            <CarouselNext className="!right-2 !top-1/2 !-translate-y-1/2 bg-black/60! text-white shadow-lg cursor-pointer" />
                          </>
                        )}
                      </Carousel>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-4 flex justify-between items-center border-t">
                  <div className="flex gap-3">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-muted-foreground flex flex-row gap-1 items-end justify-end cursor-pointer"
                      onClick={() => handleLikePost(post.id)}
                    >
                      <div>
                        {isLikedPost[post.id] ? (
                          <IoIosHeart className="h-5 w-5 text-primary" />
                        ) : (
                          <IoIosHeartEmpty className="h-5 w-5" />
                        )}
                      </div>
                      <span className="text-xs">
                        {countLikes[post.id] || 0}
                      </span>
                    </motion.div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div
                        className="text-muted-foreground flex flex-row gap-1 items-end justify-end cursor-pointer"
                        onClick={() => handleRepost(post.id)}
                      >
                        {isRepostPost[post.id] ? (
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
                      className="flex items-center space-x-2 cursor-pointer
                 hover:text-blue-600 transition-colors"
                      onClick={() => toggleCommentInput(post.id)}
                    >
                      <MessageCircle className="text-muted-foreground h-4 w-4" />
                      <label className="text-sm font-medium text-muted-foreground cursor-pointer">
                        {post.comments_count || 0}
                      </label>
                    </motion.div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div
                        className="text-muted-foreground flex flex-row gap-1 items-end justify-end cursor-pointer"
                        onClick={() => handleSavePost(post.id)}
                      >
                        {isSavedPost[post.id] ? (
                          <FaBookmark className="h-5 w-5 text-primary" />
                        ) : (
                          <FaRegBookmark className="h-5 w-5" />
                        )}
                      </div>
                    </motion.button>
                  </div>
                </CardFooter>

                {commentInputVisible[post.id] && (
                  <PostComments
                    postId={post.id}
                    userData={userData}
                    postAuthorId={post.user.id}
                  />
                )}
              </Card>
            ))}
        </div>
        <Dialog open={!!openImage} onOpenChange={() => setOpenImage(null)}>
          <DialogTitle></DialogTitle>
          <DialogContent
            className="
            max-w-2xl!   
            p-2
            flex
            items-center
            justify-center
            h-[400px]
          "
          >
            {openImage && (
              <Image
                src={openImage}
                alt="Full image"
                width={1600}
                height={900}
                className="max-w-[565px] max-h-[55vh] object-contain"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
