type CarType = {
  card: string;
  hidden: boolean;
};

export class PlayerDto {
  id: string;
  idSocket: string;
  name: string;
  profile: string;
  playing: boolean;
  totalAmountLost: number;
  betAmount: number;
  hiting: boolean;
  standing: boolean;
  currentResult: 'LOSER' | 'WINNER' | 'PLAYING' | undefined | string;
  cards: CarType[];
}
