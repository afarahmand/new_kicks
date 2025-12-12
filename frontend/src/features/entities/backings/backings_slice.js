import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as BackingApiUtil from '../../../utils/backing_api_util';

export const createBacking = createAsyncThunk(
    'backings/create',
    async (backing, { rejectWithValue }) => {
        try {
            const dbBacking = await BackingApiUtil.createBacking(backing);
            return dbBacking.backing;
        } catch (err) {
            return rejectWithValue(err);
        }
    }
)

const backingsSlice = createSlice({
    name: 'backings',
    initialState: {},
    reducers: {
        receiveBacking: (state, action) => {
            state[action.payload.id] = action.payload;
        },
        receiveBackings: (state, action) => {
            Object.keys(action.payload).forEach(backingId => {
                state[backingId] = action.payload[backingId];
            })
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createBacking.fulfilled, (state, action) => {
                state[action.payload.id] = action.payload;
            })
            .addCase(createBacking.rejected, state => state)
    }
})

export const { receiveBacking, receiveBackings } = backingsSlice.actions;
export default backingsSlice.reducer;