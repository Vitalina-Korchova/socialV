"use client";
import React, { useEffect, useRef, useState } from "react";

import { MessageCircle, Repeat, SquarePen, Trash2, User } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import CreatePostPage from "./create-post";
import { useGetAllPostsQuery } from "@/store/post/post.api";
import { Loader } from "../ui/loader";
import { ErrorState } from "../ui/error";
import { formatDate } from "@/utils/format";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import {
  useLikePostMutation,
  useRepostPostMutation,
  useSavePostMutation,
} from "@/store/like-repost-savedpost/like-repost-savedpost.api";
import { toast } from "sonner";
import { IoIosHeart, IoIosHeartEmpty } from "react-icons/io";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { motion } from "framer-motion";

import DeletePostPage from "./delete-post";
import UpdatePostPage from "./update-post";

const MAX_LINES = 4;
type DataPostToDelete = {
  id: number;
  text: string;
};
export default function PostsPage({
  id,
  type,
}: {
  id: number | undefined;
  type: string;
}) {
  const [page, setPage] = useState(1);

  const {
    data: postsData,
    error: postsError,
    isLoading: postsLoading,
  } = useGetAllPostsQuery({
    type: type,
    page: page,
    page_size: 10,
  });

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

  //update and delete
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<DataPostToDelete | null>(
    null
  );
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [updateIdPost, setUpdateIdPost] = useState<number | null>(null);

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
  const [commentTexts, setCommentTexts] = useState<{ [key: number]: string }>(
    {}
  );

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
        {type === "all" && <CreatePostPage />}
        {postsLoading && <Loader />}
        {postsError && <ErrorState />}
        {postsData?.data.length === 0 && (
          <p className="text-base text-foreground p-5">No posts</p>
        )}
        <div
          className={
            type === "mine" || type === "saved"
              ? "columns-2 gap-5 space-y-5"
              : "space-y-6"
          }
        >
          {!postsLoading &&
            !postsError &&
            postsData?.data.map((post) => (
              <Card
                key={post.id}
                className=" w-full max-w-xl mx-auto shadow-lg hover:shadow-xl
           transition-shadow duration-300 gap-3! break-inside-avoid"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">
                          {post.user.username}
                        </h3>
                        <Badge variant={"default"} className="text-xs">
                          Static badge
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 justify-end items-end">
                      {type === "mine" && (
                        <div className="flex flex-row gap-3 items-center">
                          <div
                            className="text-primary cursor-pointer hover:text-primary/60"
                            onClick={() => {
                              setUpdateIdPost(post.id);
                              setIsUpdateOpen(true);
                            }}
                          >
                            <SquarePen className="w-5 h-5" />
                          </div>
                          <div
                            className="text-primary cursor-pointer hover:text-primary/60"
                            onClick={() => {
                              setPostToDelete({
                                id: post.id,
                                text: post.text_content,
                              });
                              setIsDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="w-5 h-5" />
                          </div>
                        </div>
                      )}
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
                    className={`text-sm text-muted-foreground leading-relaxed mb-2 whitespace-pre-wrap break-words ${
                      expanded[post.id] ? "" : "line-clamp-4"
                    }`}
                  >
                    {post.text_content}
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

                  {post.images && post.images.length > 0 && (
                    <div
                      className={`grid gap-2 ${
                        post.images.length === 1
                          ? "grid-cols-1"
                          : post.images.length === 2
                          ? "grid-cols-2"
                          : "grid-cols-2"
                      }`}
                    >
                      {post.images.map((image, index) => (
                        <div
                          key={index}
                          className={`relative overflow-hidden rounded-lg ${
                            post.images.length === 3 && index === 0
                              ? "col-span-2"
                              : ""
                          }`}
                        >
                          <Image
                            src={image.url}
                            width={500}
                            height={300}
                            alt={`Post image ${index + 1}`}
                            onClick={() => setOpenImage(image.url)}
                            className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-4 flex justify-between items-center border-t">
                  <div className="flex gap-3">
                    <div className="text-muted-foreground flex flex-row gap-1 items-end justify-end">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div
                          className=" cursor-pointer"
                          onClick={() => handleLikePost(post.id)}
                        >
                          {isLikedPost[post.id] ? (
                            <IoIosHeart className="h-5 w-5 text-primary" />
                          ) : (
                            <IoIosHeartEmpty className="h-5 w-5" />
                          )}
                        </div>
                      </motion.button>
                      <span className="text-xs">
                        {countLikes[post.id] || 0}
                      </span>
                    </div>
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
                    <div
                      className="flex items-center space-x-2 cursor-pointer
                 hover:text-blue-600 transition-colors"
                      onClick={() => toggleCommentInput(post.id)}
                    >
                      <MessageCircle className="text-muted-foreground h-4 w-4" />
                      <label className="text-sm font-medium text-muted-foreground cursor-pointer">
                        Comment
                      </label>
                    </div>
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
                  <div className="px-5 flex  gap-3 items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <Input
                      className=" w-full min-w-[200px] focus-visible:ring-[#8A3CFF]/30 focus-visible:ring-2"
                      placeholder="Comment..."
                    />
                  </div>
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
        <DeletePostPage
          isDeleteOpen={isDeleteOpen}
          setIsDeleteOpen={setIsDeleteOpen}
          postToDelete={postToDelete}
          setPostToDelete={setPostToDelete}
        />
        <UpdatePostPage
          postIdToUpdate={updateIdPost as number}
          setPostIdToUpdate={setUpdateIdPost}
          isUpdateOpen={isUpdateOpen}
          setIsUpdateOpen={setIsUpdateOpen}
        />
      </div>
    </>
  );
}
