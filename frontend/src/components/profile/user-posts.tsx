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

// Масив з 5 об'єктів (у 3-х є фото)
const postsData = [
  {
    id: 1,
    name: "Robert Fox",
    position: "Software Engineer",
    date: "27 July, 2022",
    content:
      "Today marks 5 years in the software engineering field. Grateful for all the opportunities and growth along the way. Here's to many more years of coding excellence!",
    likes: 123,
    images: [
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=500&h=300&fit=crop",
    ],
  },
  {
    id: 2,
    name: "Sarah Johnson",
    position: "Frontend Developer",
    date: "15 August, 2022",
    content:
      "Just launched a new React application! So excited to see it live and getting positive feedback from users.",
    likes: 89,
    // Без фото
  },
  {
    id: 3,
    name: "Mike Chen",
    position: "Full Stack Developer",
    date: "3 September, 2022",
    content:
      "Working on some amazing new features for our platform. The team is doing incredible work!",
    likes: 156,
    images: [
      "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=500&h=300&fit=crop",
    ],
  },
  {
    id: 4,
    name: "Emily Wilson",
    position: "UI/UX Designer",
    date: "18 September, 2022",
    content:
      "Design is not just what it looks like and feels like. Design is how it works.",
    likes: 204,
    images: [
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1547658719-da2b51169166?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=500&h=300&fit=crop",
    ],
  },
  {
    id: 5,
    name: "Alex Rodriguez",
    position: "DevOps Engineer",
    date: "25 September, 2022",
    content:
      "Automated deployment pipeline is now live! Deployment time reduced by 70%.",
    likes: 67,
    // Без фото
  },
];

export default function UserPosts() {
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

  return (
    <>
      <div className="grid grid-cols-2 gap-5">
        {postsData.map((post) => (
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
                    <h3 className="font-semibold text-lg">{post.name}</h3>
                    <Badge variant={"default"} className="text-xs">
                      {post.position}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-2 justify-end items-end">
                  <Ellipsis className="text-muted-foreground cursor-pointer hover:bg-gray-100 rounded-full p-1" />
                  <span className="text-sm text-muted-foreground">
                    {post.date}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pb-4">
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {post.content}
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
                        src={image}
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
