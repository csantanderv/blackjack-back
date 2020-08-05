import { Document } from 'mongoose';

export interface IUserGame extends Document {
  totalAmountLost: number;
  totalAmountWin: number;
  betAmount: number;
}
