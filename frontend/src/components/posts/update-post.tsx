"use client";
import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { HashtagTextarea } from "../ui/hashtag-textarea";
import { ImageIcon, X } from "lucide-react";
import Image from "next/image";
import {
  useGetPostByIdQuery,
  useUpdatePostMutation,
} from "@/store/post/post.api";
import { Loader } from "../ui/loader";
import { ErrorState } from "../ui/error";
import { toast } from "sonner";

type ImagePreview = {
  file: File;
  preview: string;
};

type ImageExist = {
  id: number;
  url: string;
};

export default function UpdatePostPage({
  postIdToUpdate,
  setPostIdToUpdate,
  isUpdateOpen,
  setIsUpdateOpen,
}: {
  postIdToUpdate: number;
  setPostIdToUpdate: (id: number | null) => void;
  isUpdateOpen: boolean;
  setIsUpdateOpen: (open: boolean) => void;
}) {
  const {
    data: postData,
    isLoading: isLoadingPost,
    error: errorPost,
  } = useGetPostByIdQuery(
    { postId: postIdToUpdate },
    { skip: !postIdToUpdate }
  );
  const [
    updatePost,
    { isLoading: isLoadingUpdatePost, error: errorUpdatePost },
  ] = useUpdatePostMutation();

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [textContent, setTextContent] = useState("");
  const [imagesNew, setImagesNew] = useState<ImagePreview[]>([]);
  const [imagesExist, setImagesExist] = useState<ImageExist[]>([]);
  const [keptImagesIds, setKeptImagesIds] = useState<number[]>([]);

  useEffect(() => {
    if (postData) {
      setTextContent(postData.text_content);
      const imagesExist: ImageExist[] = postData.images.map((img) => ({
        id: img.id,
        url: img.url,
      }));
      setImagesExist(imagesExist);
      setKeptImagesIds(postData.images.map((img) => img.id));
    }
  }, [postData]);

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  const handleImagesChangeForNew = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);

    if (imagesNew.length + selectedFiles.length > 5) {
      toast.error("You can upload a maximum of 5 images");
      return;
    }

    const mapped = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImagesNew((prev) => [...prev, ...mapped]);
  };

  const handleUpdatePost = async () => {
    const totalCurrentImages = keptImagesIds.length + imagesNew.length;
    if (totalCurrentImages > 5) {
      toast.error("You can upload a maximum of 5 images");
      return;
    }
    const formData = new FormData();
    formData.append("text_content", textContent);
    imagesNew.forEach((img) => formData.append("images", img.file));
    keptImagesIds.forEach((img_id) =>
      formData.append("keep_image_ids", img_id.toString())
    );
    await updatePost({ id: postIdToUpdate, body: formData }).unwrap();
    toast.success("Post updated successfully!");

    setIsUpdateOpen(false);
    setTextContent("");
    setImagesNew([]);
    setImagesExist([]);
    setKeptImagesIds([]);
  };

  return (
    <>
      <Dialog
        open={isUpdateOpen}
        onOpenChange={(open) => {
          setIsUpdateOpen(open);
          if (!open) {
            setPostIdToUpdate(null);
          }
        }}
      >
        <DialogContent className="max-w-md z-999">
          <DialogTitle className="text-lg">Edit Post</DialogTitle>
          <div className="overflow-y-auto max-h-[55vh] custom-scrollbar pr-4">
            {isLoadingPost && <Loader />}
            {errorPost && <ErrorState />}

            {postData && (
              <>
                <div className="flex  items-top">
                  <HashtagTextarea
                    ref={textareaRef}
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    onInput={handleInput}
                    placeholder="What's on your mind?"
                    rows={1}
                    className="resize-none overflow-hidden text-base"
                  />
                </div>

                {(imagesExist.length > 0 || imagesNew.length > 0) && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {imagesExist.map((img) => (
                      <div key={`exist-${img.id}`} className="relative">
                        <Image
                          src={img.url}
                          alt="exist"
                          width={400}
                          height={400}
                          className="rounded-lg object-cover h-32 w-full"
                        />
                        <button
                          onClick={() => {
                            setImagesExist((prev) =>
                              prev.filter((image) => image.id !== img.id)
                            );
                            setKeptImagesIds((prev) =>
                              prev.filter((id) => id !== img.id)
                            );
                          }}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 cursor-pointer hover:bg-primary/60"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}

                    {imagesNew.map((img, index) => (
                      <div key={`new-${index}`} className="relative">
                        <Image
                          src={img.preview}
                          alt="new"
                          width={400}
                          height={400}
                          className="rounded-lg object-cover h-32 w-full"
                        />
                        <button
                          onClick={() => {
                            URL.revokeObjectURL(img.preview);
                            setImagesNew((prev) =>
                              prev.filter((_, i) => i !== index)
                            );
                          }}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 cursor-pointer hover:bg-primary/60"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex justify-between border-t pt-4 items-center px-5 mt-4 ">
            <label className="flex gap-3 cursor-pointer hover:text-primary">
              <ImageIcon className="w-5 h-5" />
              <span className="text-sm">Add Images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleImagesChangeForNew}
              />
            </label>

            <Button
              className="rounded-2xl cursor-pointer"
              onClick={handleUpdatePost}
              disabled={isLoadingUpdatePost || textContent.length === 0}
            >
              {isLoadingUpdatePost ? "Updating..." : "Update Post"}
            </Button>
          </div>
          {errorUpdatePost && (
            <p className="text-xs text-destructive ">
              Error occurred while updating post
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
