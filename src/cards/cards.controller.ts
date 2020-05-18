import { Controller, Get } from '@nestjs/common';
import { CardsService } from './cards.service';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get('/card-deck')
  async cardDeck(): Promise<any> {
    return this.cardsService.getCardDeck();
  }
}
