import React from "react";
import { Card } from "../ui/card";
import Image from "next/image";
import { Input } from "../ui/input";
import { ImageIcon } from "lucide-react";
import { Button } from "../ui/button";

export default function CreatePostPage() {
  return (
    <>
      <Card
        className=" w-full max-w-xl mx-auto shadow-lg hover:shadow-xl
           transition-shadow duration-300 flex flex-col px-8 pt-8 pb-5"
      >
        <div className="flex flex-row gap-4 items-center">
          <div className="w-10 h-10 ">
            <Image
              src="/back2.jpg"
              alt="border"
              width={150}
              height={150}
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          <Input
            placeholder="What's on your mind?"
            className="w-full flex-1 h-12"
          />
        </div>
        <div className="flex justify-between border-t pt-4 items-center px-5">
          <div className="flex flex-row gap-3 cursor-pointer hover:text-primary">
            <ImageIcon className="w-5 h-5" />
            <span className="text-sm">Add Images</span>
          </div>
          <Button className="rounded-2xl cursor-pointer">Post</Button>
        </div>
      </Card>
    </>
  );
}
