import { getComments } from "@/server/actions/comments";

export async function CommentList() {
  const result = await getComments();

  if (!result.success || !result.data) {
    return (
      <div className="py-4 text-center text-red-500">
        Failed to load comments
      </div>
    );
  }

  if (result.data.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-8">
      <h2 className="text-xl font-semibold">Comments</h2>
      <ul className="space-y-3">
        {result.data.map((comment) => (
          <li key={comment.id} className="border p-4 rounded-md">
            <p>{comment.comment}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {comment.createdAt.toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
