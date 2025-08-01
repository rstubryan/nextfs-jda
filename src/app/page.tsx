import { CommentForm } from "@/components/molecules/comments/comment-form";
import { CommentList } from "@/components/molecules/comments/comment-list";
import { Navbar } from "@/components/molecules/navbar";

export default function Home() {
  return (
    <main>
      <Navbar />
      <CommentForm />
      <CommentList />
    </main>
  );
}
