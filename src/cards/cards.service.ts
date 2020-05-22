import {
  Injectable,
  HttpService,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CardDeck } from './interfaces/card-deck.interface';
import { Card } from './interfaces/card.interface';
import { CardsNewGame } from './interfaces/cards-new-game.interface';

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

  async getCardsNewGame(
    deckId: string,
    totalCards: number,
  ): Promise<CardsNewGame> {
    try {
      const resp = await this.httpService
        .get(`/${deckId}/draw/?count=${totalCards}`, {
          baseURL: this.configService.get('cardApi'),
        })
        .toPromise();
      const { cards, remaining } = resp.data;

      return {
        cards: cards,
        remaining: remaining,
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

const x = {
  success: true,
  deck_id: 'zh999ecembqb',
  cards: [
    {
      code: '8C',
      image: 'https://deckofcardsapi.com/static/img/8C.png',
      images: {
        svg: 'https://deckofcardsapi.com/static/img/8C.svg',
        png: 'https://deckofcardsapi.com/static/img/8C.png',
      },
      value: '8',
      suit: 'CLUBS',
    },
    {
      code: '4H',
      image: 'https://deckofcardsapi.com/static/img/4H.png',
      images: {
        svg: 'https://deckofcardsapi.com/static/img/4H.svg',
        png: 'https://deckofcardsapi.com/static/img/4H.png',
      },
      value: '4',
      suit: 'HEARTS',
    },
    {
      code: 'JD',
      image: 'https://deckofcardsapi.com/static/img/JD.png',
      images: {
        svg: 'https://deckofcardsapi.com/static/img/JD.svg',
        png: 'https://deckofcardsapi.com/static/img/JD.png',
      },
      value: 'JACK',
      suit: 'DIAMONDS',
    },
    {
      code: '2C',
      image: 'https://deckofcardsapi.com/static/img/2C.png',
      images: {
        svg: 'https://deckofcardsapi.com/static/img/2C.svg',
        png: 'https://deckofcardsapi.com/static/img/2C.png',
      },
      value: '2',
      suit: 'CLUBS',
    },
    {
      code: '5D',
      image: 'https://deckofcardsapi.com/static/img/5D.png',
      images: {
        svg: 'https://deckofcardsapi.com/static/img/5D.svg',
        png: 'https://deckofcardsapi.com/static/img/5D.png',
      },
      value: '5',
      suit: 'DIAMONDS',
    },
    {
      code: '6D',
      image: 'https://deckofcardsapi.com/static/img/6D.png',
      images: {
        svg: 'https://deckofcardsapi.com/static/img/6D.svg',
        png: 'https://deckofcardsapi.com/static/img/6D.png',
      },
      value: '6',
      suit: 'DIAMONDS',
    },
    {
      code: '8D',
      image: 'https://deckofcardsapi.com/static/img/8D.png',
      images: {
        svg: 'https://deckofcardsapi.com/static/img/8D.svg',
        png: 'https://deckofcardsapi.com/static/img/8D.png',
      },
      value: '8',
      suit: 'DIAMONDS',
    },
    {
      code: '0S',
      image: 'https://deckofcardsapi.com/static/img/0S.png',
      images: {
        svg: 'https://deckofcardsapi.com/static/img/0S.svg',
        png: 'https://deckofcardsapi.com/static/img/0S.png',
      },
      value: '10',
      suit: 'SPADES',
    },
    {
      code: 'AS',
      image: 'https://deckofcardsapi.com/static/img/AS.png',
      images: {
        svg: 'https://deckofcardsapi.com/static/img/AS.svg',
        png: 'https://deckofcardsapi.com/static/img/AS.png',
      },
      value: 'ACE',
      suit: 'SPADES',
    },
    {
      code: 'KS',
      image: 'https://deckofcardsapi.com/static/img/KS.png',
      images: {
        svg: 'https://deckofcardsapi.com/static/img/KS.svg',
        png: 'https://deckofcardsapi.com/static/img/KS.png',
      },
      value: 'KING',
      suit: 'SPADES',
    },
  ],
  remaining: 64,
};
