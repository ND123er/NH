import { createSlice, nanoid } from '@reduxjs/toolkit';

// Initial state with some sample announcements
const initialState = {
  items: [],
};

// Announcement slice
const announcementsSlice = createSlice({
  name: 'announcements',
  initialState,
  reducers: {
    addPost: {
      reducer(state, action) {
        state.items.unshift(action.payload);
      },
      prepare({ author, role, content }) {
        return {
          payload: {
            id: nanoid(),
            author,
            role,
            content,
            createdAt: new Date().toISOString(),
            likes: 0,
            commentsCount: 0,
            pinned: false,
          },
        };
      },
    },

    // Edit an existing post - If later on required
    updatePost(state, action) {
      const { id, content } = action.payload;
      const post = state.items.find(p => p.id === id);
      if (post) post.content = content;
    },

    // Delete a post
    deletePost(state, action) {
      const id = action.payload;
      state.items = state.items.filter(p => p.id !== id);
    },

    // Toggle pin/unpin a post
    togglePin(state, action) {
      const id = action.payload;
      const post = state.items.find(p => p.id === id);
      if (post) post.pinned = !post.pinned;
    },

    // Like a post - UI change is required
    likePost(state, action) {
      const id = action.payload;
      const post = state.items.find(p => p.id === id);
      if (post) post.likes += 1;
    },
  },
});

export const { addPost, updatePost, deletePost, togglePin, likePost } = announcementsSlice.actions;

export const selectAnnouncements = state => state.announcements.items;
export const selectPinned = state => state.announcements.items.filter(p => p.pinned);

export default announcementsSlice.reducer;
