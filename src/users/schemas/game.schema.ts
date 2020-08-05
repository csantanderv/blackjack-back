import * as mongoose from 'mongoose';

export const GameSchema = new mongoose.Schema({
  dateGame: { type: Date, default: Date.now },
  currentGame: Boolean,
  status: String,
});
