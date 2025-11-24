import CardProfileOptions from "./components/card-profile-options";
import PostsPage from "./components/posts-page";

export default function Home() {
  return (
    <div className="bg-[#FAFBFF] ">
      <CardProfileOptions />
      <PostsPage />
    </div>
  );
}
