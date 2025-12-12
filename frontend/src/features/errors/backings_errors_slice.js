import { createSlice } from '@reduxjs/toolkit';
import { createBacking } from '../entities/backings/backings_slice';

const backingErrorsSlice = createSlice({
    name: 'backingsErrors',
    initialState: [],
    reducers: {
        clearBackingErrors: () => [],
    },
    extraReducers: (builder) => {
        builder
            .addCase(createBacking.fulfilled, () => [])
            .addCase(createBacking.rejected, (state, action) => action.payload)
    }
})

export const { clearBackingErrors } = backingErrorsSlice.actions;
export default backingErrorsSlice.reducer;