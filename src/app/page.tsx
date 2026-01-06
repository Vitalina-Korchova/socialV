import Navbar from "@/components/pages/navbar";
import CardProfileOptions from "../components/pages/card-profile-options";
import PostsPage from "../components/pages/posts-page";
import TopUsers from "../components/pages/top-users";

export default function Home() {
  return (
    <>
      <div className=" relative pt-6">
        <div className="flex flex-row items-start justify-around">
          <CardProfileOptions />
          <PostsPage />
          <TopUsers />
        </div>
      </div>
    </>
  );
}
