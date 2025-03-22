// src/store/slices/gameSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface GameState {
    stoneRain: boolean;
}

const initialState: GameState = {
    stoneRain: false,
};

const gameSlice = createSlice({
    name: "game",
    initialState,
    reducers: {
        setStoneRain(state, action: PayloadAction<boolean>) {
            state.stoneRain = action.payload;
        },
    },
});

export const { setStoneRain } = gameSlice.actions;
export default gameSlice.reducer;