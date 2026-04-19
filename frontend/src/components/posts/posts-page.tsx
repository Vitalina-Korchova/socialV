"use client";
import React, { useEffect, useRef, useState } from "react";
import { Loader } from "../ui/loader";
import { ErrorState } from "../ui/error";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import Image from "next/image";
import {
  useGetAllPostsQuery,
  useGetFeedQuery,
  useGenerateFeedMutation,
} from "@/store/post/post.api";
import CreatePostPage from "./create-post";
import DeletePostPage from "./delete-post";
import UpdatePostPage from "./update-post";
import { useGetMeQuery } from "@/store/user/user.api";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { PostResponse } from "@/store/post/post.type";
import { PostCard } from "./post-card";

type DataPostToDelete = {
  id: number;
  text: string;
};

export default function PostsPage({ type }: { type: string }) {
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<PostResponse[]>([]);
  const loaderRef = useRef<HTMLDivElement>(null);

  const search = useSelector((state: RootState) => state.search);
  const [prevSearch, setPrevSearch] = useState(search);
  const [prevType, setPrevType] = useState(type);

  if (search !== prevSearch || type !== prevType) {
    setPrevSearch(search);
    setPrevType(type);
    setPage(1);
    setAllPosts([]);
  }

  const isAll = type === "all";

  const {
    data: allPostsData,
    error: allPostsError,
    isFetching: allPostsFetching,
    isLoading: allPostsLoading,
  } = useGetFeedQuery({ search, page, page_size: 10 }, { skip: !isAll });

  const {
    data: otherPostsData,
    error: otherPostsError,
    isFetching: otherPostsFetching,
    isLoading: otherPostsLoading,
  } = useGetAllPostsQuery({ type, page, page_size: 10 }, { skip: isAll });

  const postsData = isAll ? allPostsData : otherPostsData;
  const postsError = isAll ? allPostsError : otherPostsError;
  const postsFetching = isAll ? allPostsFetching : otherPostsFetching;
  const postsLoading = isAll ? allPostsLoading : otherPostsLoading;

  useEffect(() => {
    if (postsData?.data) {
      setAllPosts((prev) => {
        const uniqueNewPosts = postsData.data.filter(
          (post, index, self) =>
            index === self.findIndex((p) => p.id === post.id)
        );

        if (page === 1) {
          return uniqueNewPosts;
        }
        const newPostIds = new Set(uniqueNewPosts.map((p) => p.id));
        const filteredPrev = prev.filter((p) => !newPostIds.has(p.id));
        return [...filteredPrev, ...uniqueNewPosts];
      });
    }
  }, [postsData, page]);

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

  const { data: userData, isLoading: userLoading, error: userError } = useGetMeQuery();
  const [generateFeed] = useGenerateFeedMutation();

  useEffect(() => {
    if (type === "all" && page === 1 && !search) {
      generateFeed()
        .unwrap()
        .then((res) => console.log("Feed generation check:", res.message))
        .catch((err) => console.error("Silent feed generation failed:", err));
    }
  }, [type, page, search, generateFeed]);

  const [openImage, setOpenImage] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<DataPostToDelete | null>(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [updateIdPost, setUpdateIdPost] = useState<number | null>(null);

  const handleSaveToggle = (postId: number, isSaved: boolean) => {
    if (type === "saved" && !isSaved) {
      setAllPosts((prev) => prev.filter((p) => p.id !== postId));
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
        {(postsLoading || postsFetching) && page === 1 && <Loader />}
        {postsError && <ErrorState />}
        {!postsLoading && !postsFetching && !postsError && allPosts.length === 0 && (
          <p className="text-base text-foreground p-5 text-center">
            {search && `No posts found for "${search}"`}
          </p>
        )}
        <div
          className={
            type === "mine" || type === "saved"
              ? "columns-1 sm:columns-2 gap-5 space-y-5"
              : "space-y-6"
          }
        >
          {!postsLoading && !postsError &&
            allPosts?.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                userData={userData}
                type={type}
                postsLoading={postsLoading}
                onDelete={(id, text) => {
                  setPostToDelete({ id, text });
                  setIsDeleteOpen(true);
                }}
                onUpdate={(id) => {
                  setUpdateIdPost(id);
                  setIsUpdateOpen(true);
                }}
                onImageClick={(url) => setOpenImage(url)}
                onSaveToggle={handleSaveToggle}
              />
            ))}
        </div>
        {postsData?.has_next_page && (
          <div ref={loaderRef} className="h-20 flex items-center justify-center">
            {postsLoading || postsFetching ? <Loader /> : <div>Loading...</div>}
          </div>
        )}

        <Dialog open={!!openImage} onOpenChange={() => setOpenImage(null)}>
          <DialogTitle></DialogTitle>
          <DialogContent className="max-w-2xl! p-2 flex items-center justify-center h-[400px]">
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
