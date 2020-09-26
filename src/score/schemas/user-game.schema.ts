import * as mongoose from 'mongoose';

export const UserGameSchema = new mongoose.Schema({
  totalAmountLost: Number,
  totalAmountWin: Number,
  betAmount: Number,
  game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserGame' },
});
