import {
  Injectable,
  HttpService,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CardDeck } from './interfaces/card-deck.interface';
import { Card } from './interfaces/card.interface';

@Injectable()
export class CardsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async getCardDeck(): Promise<CardDeck> {
    try {
      const resp = await this.httpService
        .get('/new/shuffle/?deck_count=2', {
          baseURL: this.configService.get('cardApi'),
        })
        .toPromise();
      return resp.data;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async getCard(deckId: string): Promise<Card> {
    try {
      const resp = await this.httpService
        .get(`/${deckId}/draw/?count=1`, {
          baseURL: this.configService.get('cardApi'),
        })
        .toPromise();
      const card = resp.data.cards[0];

      return {
        code: card.code,
        img: card.images.svg,
        remaining: resp.data.remaining,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async reshuffleCards(deckId: string): Promise<CardDeck> {
    try {
      const resp = await this.httpService
        .get(`/${deckId}/shuffle/`, {
          baseURL: this.configService.get('cardApi'),
        })
        .toPromise();
      return resp.data;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}
