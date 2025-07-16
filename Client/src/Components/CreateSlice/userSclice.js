
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const uploadFile = createAsyncThunk(
  "userDetail/uploadFile",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("your-api-endpoint", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("File upload failed");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const userDetailSlice = createSlice({
  name: "userDetail",
  initialState: {
    file: [],
    searchFile: [],
    loading: false,
    error: null,
    viewUpload: false,
  },
  reducers: {
    setUploadOption: (state) => {
      state.viewUpload = !state.viewUpload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadFile.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.loading = false;
        state.file.push(action.payload);
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUploadOption } = userDetailSlice.actions;

export default userDetailSlice.reducer;
