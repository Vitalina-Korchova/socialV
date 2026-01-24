"use client";
import React, { useState } from "react";

import {
  Bookmark,
  Ellipsis,
  MessageCircle,
  Repeat,
  ThumbsUp,
  User,
} from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import CreatePostPage from "./create-post";
import { useGetAllPostsQuery } from "@/store/post/post.api";
import { Loader } from "../ui/loader";
import { ErrorState } from "../ui/error";
import { formatDate } from "@/utils/format";

export default function PostsPage() {
  const [page, setPage] = useState(1);

  const {
    data: postsData,
    error: postsError,
    isLoading: postsLoading,
  } = useGetAllPostsQuery({ page: page, page_size: 10 });
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

  if (postsLoading) {
    return <Loader />;
  }

  if (postsError) {
    return <ErrorState />;
  }
  return (
    <>
      <div className="flex flex-col gap-7">
        <CreatePostPage />
        {postsData?.data.map((post) => (
          <Card
            key={post.id}
            className=" w-full max-w-xl mx-auto shadow-lg hover:shadow-xl
           transition-shadow duration-300"
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
                  <Ellipsis className="text-muted-foreground cursor-pointer hover:bg-gray-100 rounded-full p-1" />
                  <span className="text-sm text-muted-foreground">
                    {formatDate(post.created_at)}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pb-4">
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {post.text_content}
              </p>

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
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-4 flex justify-between items-center border-t">
              <div className="flex gap-3">
                <div className="text-muted-foreground flex flex-row gap-1 items-end justify-end">
                  <ThumbsUp className="h-5 w-5" />
                  <span className="text-xs">{post.likes}</span>
                </div>
                <div className="text-muted-foreground flex flex-row gap-1 items-end justify-end">
                  <Repeat className="h-5 w-5" />
                </div>
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
                <div className="text-muted-foreground flex flex-row gap-1 items-end justify-end">
                  <Bookmark className="h-5 w-5" />
                </div>
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
    </>
  );
}
