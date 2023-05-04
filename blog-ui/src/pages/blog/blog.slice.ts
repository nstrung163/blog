import { AsyncThunk, createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { Post } from 'types/blog.type'
import http from 'utils/http'

type GenericAsyncThunk = AsyncThunk<unknown, unknown, any>

type PendingAction = ReturnType<GenericAsyncThunk['pending']>
type RejectedAction = ReturnType<GenericAsyncThunk['rejected']>
type FulfilledAction = ReturnType<GenericAsyncThunk['fulfilled']>

interface BlogState {
  postList: Post[]
  postEditing: Post | null
  loading: boolean
  currentRequestId: string | undefined
}

const initState: BlogState = {
  postList: [],
  postEditing: null,
  loading: false,
  currentRequestId: undefined
}

export const finishEditingPost = createAction<Post>('/blog/finishEditingPost')

export const getPostList = createAsyncThunk('blog/getPostList', async (_, thunkApi) => {
  const response = await http.get<Post[]>('posts', {
    signal: thunkApi.signal
  })
  return response.data
})

export const addPost = createAsyncThunk('blog/addPost', async (body: Omit<Post, 'id'>, thunkApi) => {
  try {
    const response = await http.post<Post>('posts', body, { signal: thunkApi.signal })
    return response.data
  } catch (error: any) {
    if (error.name === 'AxiosError' && error.response.state === 422) {
      return thunkApi.rejectWithValue(error.response.data)
    }
    throw error
  }
})

export const updatePost = createAsyncThunk(
  'blog/updatePost',
  async ({ postId, body }: { postId: string; body: Post }, thunkApi) => {
    const response = await http.put<Post>(`posts/${postId}`, body, { signal: thunkApi.signal })
    return response.data
  }
)

export const deletePost = createAsyncThunk('blog/deletePost', async (postId: string, thunkApi) => {
  const response = await http.delete<Post>(`posts/${postId}`, { signal: thunkApi.signal })
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
      .addMatcher<PendingAction>(
        (action) => action.type.endsWith('pending'),
        (state, action) => {
          state.loading = true
          state.currentRequestId = action.meta.requestId
        }
      )
      .addMatcher<FulfilledAction | RejectedAction>(
        (action) => action.type.endsWith('rejected') || action.type.endsWith('fulfilled'),
        (state, action) => {
          if (state.currentRequestId === action.meta.requestId) {
            state.loading = false
            state.currentRequestId = undefined
          }
        }
      )
  }
})

export const { startEditingPost, cancelEditingPost } = blogSlice.actions
const blogReducer = blogSlice.reducer
export default blogReducer
