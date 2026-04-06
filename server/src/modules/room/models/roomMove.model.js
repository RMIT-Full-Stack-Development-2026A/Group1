import mongoose from "mongoose";

export const roomMoveSchema = new mongoose.Schema({
  moveNumber: Number, // Sequential order of live moves
  byParticipantIndex: { type: Number, enum: [0, 1] }, // Which side made the move
  row: Number, // Row index of the move
  col: Number, // Column index of the move
  coordinate: { // Algebraic notation for readable room/replay mapping
    type: String,
    match: /^[A-O](?:[1-9]|1[0-5])$/
  },
  placedAt: { type: Date, default: Date.now } // When the move happened
}, { _id: false });