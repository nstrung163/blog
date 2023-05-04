import { createAction, createReducer, current, nanoid } from '@reduxjs/toolkit'
import { initPostList } from 'constants/blog'
import { Post } from 'types/blog.type'

interface BlogState {
  postList: Post[]
  postEditing: Post | null
}

const initState: BlogState = {
  postList: initPostList,
  postEditing: null
}
export const addPost = createAction('blog/addPost', function (post: Omit<Post, 'id'>) {
  return {
    payload: {
      ...post,
      id: nanoid()
    }
  }
})

export const deletePost = createAction<string>('blog/deletePost')

export const startEditingPost = createAction<string>('/blog/startEditingPost')

export const cancelEditingPost = createAction('/blog/cancelEditingPost')

export const finishEditingPost = createAction<Post>('/blog/finishEditingPost')

const blogReducer = createReducer(initState, (builder) => {
  builder
    .addCase(addPost, (state, action) => {
      // immerjs helps us mutate a sate safe
      const post = action.payload
      state.postList.push(post)
    })
    .addCase(deletePost, (state, action) => {
      console.log('Before Editing', current(state))
      const postId = action.payload
      const foundPostIndex = state.postList.findIndex((post) => post.id === postId)
      if (foundPostIndex !== -1) {
        state.postList.splice(foundPostIndex, 1)
      }
      console.log('End Editing', current(state))
    })
    .addCase(startEditingPost, (state, action) => {
      const postId = action.payload
      const post = state.postList.find((postItem) => postItem.id === postId) || null
      state.postEditing = post
    })
    .addCase(cancelEditingPost, (state) => {
      state.postEditing = null
    })
    .addCase(finishEditingPost, (state, action) => {
      const postId = action.payload.id
      state.postList.some((postItem, index) => {
        if (postItem.id === postId) {
          state.postList[index] = action.payload
          return true
        }
        return false
      })
    })
    .addMatcher(
      (action) => action.type.includes('cancel'),
      (state, action) => {
        console.log('addMatcher', current(state))
      }
    )
})

export default blogReducer
