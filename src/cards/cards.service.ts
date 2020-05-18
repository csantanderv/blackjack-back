import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CardsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async getCardDeck(): Promise<CardDeck> {
    const resp = await this.httpService
      .get('/deck/new/shuffle/?deck_count=2', {
        baseURL: this.configService.get('cardApi'),
      })
      .toPromise();
    return resp.data;
  }
}
