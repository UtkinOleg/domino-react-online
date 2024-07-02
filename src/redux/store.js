import { configureStore } from '@reduxjs/toolkit'
import dominoSlice from './dominoSlice'
import dominoSliceOnline from './dominoSliceOnline'
import dragNdropSlice from './dragNdropSlice'

const store = configureStore({
  reducer: {
    domino: dominoSlice,
    domino_online: dominoSliceOnline,
    dragNdrop: dragNdropSlice,
  },
});
export default store
