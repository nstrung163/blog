import { createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { Post } from 'types/blog.type'
import http from 'utils/http'

interface BlogState {
  postList: Post[]
  postEditing: Post | null
}

const initState: BlogState = {
  postList: [],
  postEditing: null
}

export const finishEditingPost = createAction<Post>('/blog/finishEditingPost')

export const getPostList = createAsyncThunk('blog/getPostList', async (_, thunkApi) => {
  const response = await http.get('posts', {
    signal: thunkApi.signal
  })
  return response.data
})

export const addPost = createAsyncThunk('blog/addPost', async (body: Omit<Post, 'id'>, thunkApi) => {
  const response = await http.post('posts', body, { signal: thunkApi.signal })
  return response.data
})

export const updatePost = createAsyncThunk(
  'blog/updatePost',
  async ({ postId, body }: { postId: string; body: Post }, thunkApi) => {
    const response = await http.put(`posts/${postId}`, body, { signal: thunkApi.signal })
    return response.data
  }
)

export const deletePost = createAsyncThunk('blog/deletePost', async (postId: string, thunkApi) => {
  const response = await http.delete(`posts/${postId}`, { signal: thunkApi.signal })
  return response.data
})

const blogSlice = createSlice({
  name: 'blog',
  initialState: initState,
  reducers: {
    startEditingPost: (state, action) => {
      const postId = action.payload
      const post = state.postList.find((postItem) => postItem.id === postId) || null
      state.postEditing = post
    },
    cancelEditingPost: (state, action) => {
      state.postEditing = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPostList.fulfilled, (state, action) => {
        state.postList = action.payload
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.postList.find((post, index) => {
          if (post.id === action.payload.id) {
            state.postList[index] = action.payload
            state.postEditing = null
            return true
          }
          return false
        })
      })
      .addCase(addPost.fulfilled, (state, action) => {
        state.postList.push(action.payload)
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const postId = action.meta.arg
        const postDeleteIndex = state.postList.findIndex((post) => post.id === postId)
        if (postDeleteIndex !== -1) {
          state.postList.splice(postDeleteIndex, 1)
        }
      })
  }
})

export const { startEditingPost, cancelEditingPost } = blogSlice.actions
const blogReducer = blogSlice.reducer
export default blogReducer

// const blogReducer = createReducer(initState, (builder) => {
//   builder
//     .addCase(addPost, (state, action) => {
//       // immerjs helps us mutate a sate safe
//       const post = action.payload
//       state.postList.push(post)
//     })
//     .addCase(deletePost, (state, action) => {
//       console.log('Before Editing', current(state))
//       const postId = action.payload
//       const foundPostIndex = state.postList.findIndex((post) => post.id === postId)
//       if (foundPostIndex !== -1) {
//         state.postList.splice(foundPostIndex, 1)
//       }
//       console.log('End Editing', current(state))
//     })
//     .addCase(startEditingPost, (state, action) => {
//       const postId = action.payload
//       const post = state.postList.find((postItem) => postItem.id === postId) || null
//       state.postEditing = post
//     })
//     .addCase(cancelEditingPost, (state) => {
//       state.postEditing = null
//     })
//     .addCase(finishEditingPost, (state, action) => {
//       const postId = action.payload.id
//       state.postList.some((postItem, index) => {
//         if (postItem.id === postId) {
//           state.postList[index] = action.payload
//           return true
//         }
//         return false
//       })
//     })
//     .addMatcher(
//       (action) => action.type.includes('cancel'),
//       (state, action) => {
//         console.log('addMatcher', current(state))
//       }
//     )
// })

// export default blogReducer
