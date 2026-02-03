"use client";

import CardProfileOptions from "../components/pages/card-profile-options";
import PostsPage from "../components/posts/posts-page";
import TopUsers from "../components/pages/top-users";
import { useGetMeQuery } from "@/store/user/user.api";

export default function Home() {
  const { data: userData } = useGetMeQuery();

  return (
    <>
      <div className=" relative pt-6">
        <div className="flex flex-row items-start justify-around">
          <CardProfileOptions />
          <PostsPage id={userData?.id} type="all" />
          <TopUsers />
        </div>
      </div>
    </>
  );
}
