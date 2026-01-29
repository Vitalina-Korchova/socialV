import React, { useRef, useState } from "react";
import { Card } from "../ui/card";
import Image from "next/image";
import { ImageIcon, X } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { useCreatePostMutation } from "@/store/post/post.api";

type ImagePreview = {
  file: File;
  preview: string;
};

export default function CreatePostPage() {
  const [textContent, setTextContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [createPost, { isLoading: loadingCreatePost, error: errorCreatePost }] =
    useCreatePostMutation();
  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);

    if (images.length + selectedFiles.length > 5) {
      toast.error("You can upload a maximum of 5 images");
      return;
    }

    const mapped = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...mapped]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleCreatePost = async () => {
    const formData = new FormData();
    formData.append("text_content", textContent);
    images.forEach((img) => formData.append("images", img.file));
    await createPost(formData).unwrap();
    setTextContent("");
    setImages([]);
    toast.success("Post created successfully!");
  };
  return (
    <>
      <Card
        className="  w-xl mx-auto shadow-lg hover:shadow-xl
           transition-shadow duration-300 flex flex-col px-8 pt-8 pb-5"
      >
        <div className="flex flex-row gap-4 items-top">
          <div className="w-10 h-10 ">
            <Image
              src="/back2.jpg"
              alt="border"
              width={150}
              height={150}
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          <Textarea
            ref={textareaRef}
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            onInput={handleInput}
            placeholder="What's on your mind?"
            rows={1}
            className="resize-none overflow-hidden  text-base"
          />
        </div>
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            {images.map((img, index) => (
              <div key={index} className="relative">
                <Image
                  src={img.preview}
                  alt="preview"
                  width={200}
                  height={200}
                  className="rounded-lg object-cover h-32 w-full"
                />

                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 cursor-pointer hover:bg-primary/60"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between border-t pt-4 items-center px-5 mt-4">
          <label className="flex gap-3 cursor-pointer hover:text-primary">
            <ImageIcon className="w-5 h-5" />
            <span className="text-sm">Add Images</span>

            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleImagesChange}
            />
          </label>

          <Button
            className="rounded-2xl cursor-pointer"
            onClick={handleCreatePost}
            disabled={loadingCreatePost || textContent.length === 0}
          >
            {loadingCreatePost ? "Posting..." : "Post"}
          </Button>
        </div>
        {errorCreatePost && (
          <p className="text-xs text-destructive ">
            Error occurred while creating post
          </p>
        )}
      </Card>
    </>
  );
}
