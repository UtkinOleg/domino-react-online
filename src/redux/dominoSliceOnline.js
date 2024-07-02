import { createSlice, current } from '@reduxjs/toolkit'
import { combinationsWithRepetition, shuffle } from '../util/combinatorics'
import { loadStateOnline, saveStateOnline } from '../util/localStorage'
import {
  insertTileToPlayline,
  getEdges,
  getNumbers,
  moveTile,
} from '../util/tileOperations'
import { socket } from '../util/socket';

const initialState = {
  initialStock: [],
  stock: [],
  playline: [],
  players: [],
  reload: true,
  winner: null,
  move: null,
  waiting: false,
  firstInPlayline: {
    id: '11',
    isRotated: false,
    lastCoords: {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    },
  },
};

const dominoSliceOnline = createSlice({
  name: 'domino_online',
  initialState,
  reducers: {

    restartGame: (state) => {
      state.reload = false;
      state.winner = null;
      state.move = null;
      state.stock = [];
      state.playline = [];
      state.initialStock = [];
      state.players = [];
      state.waiting = false;
    },

    setTileCoords: (state, { payload: { tile, lastCoords } }) => {
      if (state.players.length === 2) {
        const stocks = [state.players[0].stock, state.players[1].stock, state.stock, state.playline];
        const stock = stocks.find((s) => s.some((t) => t.id === tile.id))
        const tileInStock = stock.find((t) => t.id === tile.id)
        tileInStock.lastCoords = lastCoords
      }
    },

    unsetUserTileCoords: (state, { payload }) => {
      const userTile = state.players[0].stock.find((t) => t.id === payload.id)
      userTile.lastCoords = null
    },

    putTileToStock: (state) => moveTile({ from: state.initialStock, to: state.stock }),

    drawTileToOpponent: (state) => {
      if (state.players.length === 2) {
        moveTile({ from: state.stock, to: state.players[1].stock })
      }  
    },
    
    drawFirstTileToPlayline: (state) => {
      state.playline.push(state.firstInPlayline)
    },

    drawTileToUser: (state) => { 
      if (state.players.length >= 1) {
        moveTile({ from: state.stock, to: state.players[0].stock })
        socket.connect()
        socket.timeout(5000).emit('events', 
          JSON.stringify({ handleTile: true, user: state.players[0], stock: state.stock }), () => {
        })
      }  
    },

    userMakesMove: (state, { payload: { tile, position } }) => {
      if (!state.winner) {
        const user = state.players[0]
        const playersTile = user.stock.find((t) => t.id === tile.id)
        if (playersTile) {
          insertTileToPlayline({
            playline: state.playline,
            tile: playersTile,
            position,
          })
          state.move = state.players[1].id
          saveStateOnline(state)
          
          // send message
          socket.connect()
          socket.timeout(5000).emit('events', 
            JSON.stringify({
              makeMove: true, 
              user: state.players[0], 
              tile: playersTile, 
              playline: state.playline
            }), () => {});
      
          // remove matched tile from player's stock
          user.stock = user.stock.filter((t) => t !== playersTile)
          if (user.stock.length === 0) {
            // game over
            state.winner = user
          }
        }
      }
    },

    userMissesMove: (state) => {
      state.players[0].missedLastMove += 1;
      state.move = state.players[1].id;
      socket.connect();
      socket.timeout(5000).emit('events', 
        JSON.stringify({ missMove: true, user: state.players[0] }), () => {
      })
    },

    addPlayer: (state, { payload }) => {
      state.players = [];
      if (state.players.length === 0) {
        state.players.push({
          id: payload.id,
          missedLastMove: 0,
          name: payload.name,
          stock: [],
        });
      }
    },

    addOpponent: (state, { payload }) => {
      if (state.players.length === 1) {
        state.players.push({
          id: payload.id,
          missedLastMove: 0,
          name: payload.name,
          stock: [],
        });
      }
    },

    // Send new gameplay stocks to opponent
    sendStock: (state, { payload }) => {
      if (state.players.length === 2) {
        socket.connect();
        socket.timeout(5000).emit('events', 
          JSON.stringify({
            updateStock: true, 
            stock: state.stock, 
            user: payload,
            first_tile: state.firstInPlayline,
            user_stock: state.players[0] ? state.players[0].stock : [], 
            opponent_stock: state.players[1] ? state.players[1].stock : [] 
          }), () => {
        })
      }
    },

    updatePlayerStock: (state, { payload }) => {
      if (state.players.length === 2) {
        state.players[0].stock = payload
      }
    },

    updateOpponentStock: (state, { payload }) => {
      if (state.players.length === 2) {
        state.players[1].stock = payload
      }
    },

    updateStock: (state, { payload }) => {
      if (state.players.length === 2) {
        state.stock = payload
      }
    },

    updateFirstTile: (state, { payload }) => {
      if (state.players.length === 2) {
        state.firstInPlayline = payload
      }
    },

    updatePlayline: (state, { payload }) => {
      state.playline = payload
    },

    updateMove: (state, { payload }) => {
      state.move = payload
    },

    resetInitialStock: (state) => {
      if (state.players.length === 2) {
        console.log('init olnine game!');
        state.initialStock = combinationsWithRepetition(
          [...Array(7).keys()],
          2,
        ).map((tile) => ({
          id: tile.join(''),
          isRotated: false,
          lastCoords: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
          },
        }));
        shuffle(state.initialStock);
        state.firstInPlayline = state.initialStock.splice(state.initialStock.length - 1)[0];
      }
    },

    opponentMakesMove: (state, { payload }) => {
      if (!state.winner) {
        if (state.players.length === 2) {
          const opponent = state.players[1];
          opponent.missedLastMove = 0
          const tile = payload;
          insertTileToPlayline({ playline: state.playline, tile })
          opponent.stock = opponent.stock.filter((t) => t.id !== tile.id)
          if (opponent.stock.length === 0) {
            // game over
            state.winner = opponent
          }
          saveStateOnline(state)
        }
      }
    },
  },
});

export const {
  opponentMakesMove,
  drawTileToOpponent,
  drawTileToUser,
  drawFirstTileToPlayline,
  putTileToStock,
  restartGame,
  setTileCoords,
  unsetUserTileCoords,
  userMakesMove,
  userMissesMove,
  setFirstInPlayline,
  addPlayer,
  addOpponent,
  updateOpponentStock,
  updatePlayerStock,
  updateStock,
  resetInitialStock,
  sendStock,
  updatePlayline,
  updateMove,
  updateFirstTile,
} = dominoSliceOnline.actions
export default dominoSliceOnline.reducer
