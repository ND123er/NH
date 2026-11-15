import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAssets as apiFetchAssets, addAsset as apiAddAsset } from '../api/assets';

export const fetchAssetsThunk = createAsyncThunk(
  'assets/fetchAssets',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiFetchAssets();
      return data;
    } catch (err) {
      return rejectWithValue(err?.message || err);
    }
  }
);

export const addAssetThunk = createAsyncThunk(
  'assets/addAsset',
  async (payload, { rejectWithValue }) => {
    try {
      const data = await apiAddAsset(payload);
      return data;
    } catch (err) {
      return rejectWithValue(err?.message || err);
    }
  }
);

const assetsSlice = createSlice({
  name: 'assets',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssetsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssetsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.data || action.payload || [];
      })
      .addCase(fetchAssetsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addAssetThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAssetThunk.fulfilled, (state, action) => {
        state.loading = false;
        // prepend or push depending on API response
        const newItem = action.payload?.data || action.payload || null;
        if (newItem) state.items.unshift(newItem);
      })
      .addCase(addAssetThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const selectAssets = (state) => state.assets.items;
export default assetsSlice.reducer;
