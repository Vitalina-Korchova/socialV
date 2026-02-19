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
import { useRouter } from "next/navigation";
import { useGetMeQuery } from "@/store/user/user.api";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { PostResponse } from "@/store/post/post.type";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { TbUserStar } from "react-icons/tb";
import PostComments from "./post-comments";

const MAX_LINES = 4;
type DataPostToDelete = {
  id: number;
  text: string;
};
export default function PostsPage({ type }: { type: string }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<PostResponse[]>([]);
  const loaderRef = useRef<HTMLDivElement>(null);

  const search = useSelector((state: RootState) => state.search);

  const {
    data: postsData,
    error: postsError,
    isLoading: postsLoading,
  } = useGetAllPostsQuery({
    type: type,
    search: type === "all" ? search : "",
    page: page,
    page_size: 10,
  });

  useEffect(() => {
    if (postsData?.data) {
      setAllPosts((prev) => {
        if (page === 1) {
          return postsData.data;
        }
        const newPostIds = new Set(postsData.data.map((p) => p.id));
        const filteredPrev = prev.filter((p) => !newPostIds.has(p.id));
        return [...filteredPrev, ...postsData.data];
      });
    }
  }, [postsData, page, search]);

  // Intersection Observer
  useEffect(() => {
    if (!loaderRef.current || !postsData?.has_next_page) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !postsLoading) {
          setPage((prev) => prev + 1);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [postsData, postsLoading, loaderRef.current]);

  useEffect(() => {
    setAllPosts([]);
    setPage(1);
  }, [type, search]);

  const { data: userData, isLoading: userLoading, error: userError } = useGetMeQuery();

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
    allPosts?.forEach((post) => {
      measureLines(post.id);
    });
  }, [allPosts]);

  useEffect(() => {
    const handleResize = () => {
      allPosts?.forEach((post) => {
        measureLines(post.id);
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [allPosts]);

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
        {type === "all" && (
          <CreatePostPage
            userData={userData!}
            userLoading={userLoading}
            userError={!!userError}
          />
        )}
        {postsLoading && <Loader />}
        {postsError && <ErrorState />}
        {!postsLoading && !postsError && allPosts.length === 0 && (
          <p className="text-base text-foreground p-5 text-center">
            {search && `No posts found for "${search}"`}
          </p>
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
            allPosts?.map((post) => (
              <Card
                key={post.id}
                className=" w-full max-w-xl mx-auto shadow-lg hover:shadow-xl
           transition-shadow duration-300 gap-3! break-inside-avoid"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 relative flex items-center justify-center ${type === "all" || type === "saved" ? "cursor-pointer" : ""
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
                          <div className="absolute inset-x-0 inset-y-0 overflow-hidden">
                            <Image
                              src={post.user.border_url}
                              alt="animated border"
                              width={100}
                              height={100}
                              className="w-full h-full object-cover scale-150"
                              priority
                            />
                          </div>
                        )}
                        {postsLoading ? (
                          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center relative z-10">
                            <TbUserStar className="w-5 h-5 text-primary" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center relative z-10 overflow-hidden">
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
                    className={`text-sm text-muted-foreground leading-relaxed mb-2 whitespace-pre-wrap break-words ${expanded[post.id] ? "" : "line-clamp-4"
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
                {post.repostedByUsers && post.repostedByUsers.length > 1 && (
                  <div className="px-5 pb-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex -space-x-2">
                      {post.repostedByUsers.slice(0, 2).map((user, idx) => (
                        <div key={idx} className="h-6 w-6 relative flex items-center justify-center">
                          {user.border_url && (
                            <div className="absolute inset-0 overflow-hidden">
                              <Image
                                src={user.border_url}
                                alt="border"
                                width={50}
                                height={50}
                                className="w-full h-full object-cover scale-150"
                              />
                            </div>
                          )}
                          <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center border border-background relative z-10 overflow-hidden">
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
                      onClick={() => handleLikePost(post.id)}
                    >
                      <div>
                        {isLikedPost[post.id] ? (
                          <IoIosHeart className="h-5 w-5 text-primary" />
                        ) : (
                          <IoIosHeartEmpty className="h-5 w-5" />
                        )}
                      </div>
                      <span className="text-xs">{countLikes[post.id] || 0}</span>
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
        {postsData?.has_next_page && (
          <div
            ref={loaderRef}
            className="h-20 flex items-center justify-center"
          >
            {postsLoading ? <Loader /> : <div>Loading...</div>}
          </div>
        )}

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
