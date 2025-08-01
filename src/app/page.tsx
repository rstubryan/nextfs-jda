import { CommentForm } from "@/components/molecules/comments/comment-form";
import { CommentList } from "@/components/molecules/comments/comment-list";
import { Navbar } from "@/components/molecules/navbar";

export default function Home() {
  return (
    <main className="container max-w-3xl mx-auto py-12 px-4">
      <Navbar />
      <CommentForm />
      <CommentList />
    </main>
  );
}
