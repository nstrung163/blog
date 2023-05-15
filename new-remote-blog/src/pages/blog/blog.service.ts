import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { Post } from "types/blog.type"

export const blogApi = createApi({
  reducerPath: "blogApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:4000" }),
  tagTypes: ["Posts"],
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], void>({
      query: () => "posts",
      providesTags(result) {
        if (result) {
          const final = [
            ...result.map(({ id }) => ({ type: "Posts" as const, id })),
            { type: "Posts" as const, id: "LIST" }
          ]
          return final
        }
        return [{ type: "Posts", id: "LIST" }]
      }
    }),
    addPosts: builder.mutation<Post, Omit<Post, "id">>({
      query(body) {
        return {
          url: "posts",
          method: "POST",
          body
        }
      },
      invalidatesTags: (result, error, body) => (error ? [] : [{ type: "Posts", id: "LIST" }])
    }),
    getPost: builder.query<Post, string>({
      query: (id) => `/posts/${id}`
    }),
    updatePost: builder.mutation<Post, { id: string; body: Post }>({
      query: (data) => {
        return {
          url: `posts/${data.id}`,
          method: "PUT",
          body: data.body
        }
      },
      invalidatesTags: (result, error, data) => (error ? [] : [{ type: "Posts", id: data.id }])
    }),
    deletePost: builder.mutation<{}, string>({
      query: (id) => {
        return {
          url: `/posts/${id}`,
          method: "DELETE"
        }
      },
      invalidatesTags: (result, error, id) => (error ? [] : [{ type: "Posts", id }])
    })
  })
})

export const { useGetPostsQuery, useAddPostsMutation, useGetPostQuery, useUpdatePostMutation, useDeletePostMutation } =
  blogApi
