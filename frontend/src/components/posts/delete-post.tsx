import React from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { useDeletePostMutation } from "@/store/post/post.api";
import { toast } from "sonner";

type DataPostToDelete = {
  id: number;
  text: string;
};
export default function DeletePostPage({
  isDeleteOpen,
  setIsDeleteOpen,
  postToDelete,
  setPostToDelete,
}: {
  postToDelete: DataPostToDelete | null;
  setPostToDelete: (post: DataPostToDelete | null) => void;
  isDeleteOpen: boolean;
  setIsDeleteOpen: (open: boolean) => void;
}) {
  const [deletePost, { isLoading: isLoadingDeletePost }] =
    useDeletePostMutation();
  const handleDeletePost = async () => {
    if (!postToDelete?.id) return;
    try {
      await deletePost(postToDelete.id).unwrap();
      toast.success("Post deleted successfully");
      setIsDeleteOpen(false);
    } catch (error) {
      toast.error("Error deleting post");
    }
  };

  return (
    <>
      <Dialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) {
            setPostToDelete(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogTitle className="text-lg">Delete post?</DialogTitle>

          <p className="text-sm text-muted-foreground mt-2">
            Are you sure you want to delete this post?
          </p>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>

            <Button
              onClick={handleDeletePost}
              disabled={isLoadingDeletePost}
              className="px-4 py-2 text-sm rounded-md disabled:opacity-50 cursor-pointer"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
