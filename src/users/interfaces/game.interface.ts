import { Document } from 'mongoose';

export interface IGame extends Document {
  dateGame: Date;
  currentGame: Boolean;
  status: String;
}
