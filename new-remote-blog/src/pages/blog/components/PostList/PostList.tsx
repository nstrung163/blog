import { Fragment } from "react"
import PostItem from "../PostItem"
import { useDeletePostMutation, useGetPostsQuery } from "pages/blog/blog.service"
import Skeleton from "../Skeleton"
import { Post } from "types/blog.type"
import { useDispatch } from "react-redux"
import { startEditingPost } from "pages/blog/blog.slice"

export default function PostList() {
  const { data, isFetching } = useGetPostsQuery()
  const dispatch = useDispatch()
  const startEditing = (id: string) => {
    dispatch(startEditingPost(id))
  }
  const [deletePost] = useDeletePostMutation()
  const handleDeletePost = (id: string) => {
    deletePost(id)
  }
  return (
    <div>
      <div className='bg-white py-6 sm:py-8 lg:py-12'>
        <div className='mx-auto max-w-screen-xl px-4 md:px-8'>
          <div className='mb-10 md:mb-16'>
            <h2 className='mb-4 text-center text-2xl font-bold text-gray-800 md:mb-6 lg:text-3xl'>Dev Blog</h2>
            <p className='mx-auto max-w-screen-md text-center text-gray-500 md:text-lg'>
              Đừng bao giờ từ bỏ. Hôm nay khó khăn, ngày mai sẽ trở nên tồi tệ. Nhưng ngày mốt sẽ có nắng
            </p>
          </div>
          <div className='grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-2 xl:grid-cols-2 xl:gap-8'>
            {isFetching && (
              <Fragment>
                <Skeleton />
                <Skeleton />
              </Fragment>
            )}
            {!isFetching &&
              data?.map((post: Post) => (
                <PostItem key={post.id} post={post} startEditing={startEditing} handleDeletePost={handleDeletePost} />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
