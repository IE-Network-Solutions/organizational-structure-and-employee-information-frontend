'use client';
import { AddPostData } from '@/store/server/features/posts/interface';
import {
  useAddPost,
  useDeletePost,
} from '@/store/server/features/posts/mutation';
import { useGetPosts } from '@/store/server/features/posts/queries';
import usePostStore from '@/store/uistate/features/posts/useStore';
import { useState } from 'react';

const Posts = () => {
  const counter = usePostStore((state) => state.counter);
  const increment = usePostStore((state) => state.incrementCounter);
  const decrement = usePostStore((state) => state.decrementCounter);

  const { isLoading: isGetPostsLoading, data: getPostsData } = useGetPosts();
  const addPostMutation = useAddPost();
  const deletPostMutation = useDeletePost();

  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  const handleAddPost = () => {
    const newPost: AddPostData = {
      title: newPostTitle,
      description: newPostContent,
      image: 'image link',
      itemCount: 2,
      price: 200,
    };
    addPostMutation.mutate(newPost);
  };
  const handleDeletePost = (postId: string) => {
    deletPostMutation.mutate(postId);
  };

  return (
    <>
      <button onClick={decrement}>-</button>
      <span>{counter}</span>
      <button onClick={increment}>+</button>

      <input
        type="text"
        name="postTitle"
        placeholder="Post title"
        value={newPostTitle}
        onChange={(e) => setNewPostTitle(e.target.value)}
      />
      <textarea
        name="postContent"
        placeholder="Content of the post"
        value={newPostContent}
        onChange={(e) => setNewPostContent(e.target.value)}
      ></textarea>

      <button onClick={handleAddPost}>
        Add A post {addPostMutation.isLoading && '...'}
      </button>
      <div className="">
        {isGetPostsLoading ? (
          <p>Loading ...</p>
        ) : (
          getPostsData &&
          getPostsData?.map((post) => (
            <div className="" key={post.id}>
              <h4>{post.title}</h4>
              <p>{post.description}</p>
              <button onClick={() => handleDeletePost(post.id)}>Delete</button>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default Posts;
