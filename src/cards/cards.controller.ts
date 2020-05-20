import { Controller, Get, Param } from '@nestjs/common';
import { CardsService } from './cards.service';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get('/card-deck')
  async cardDeck(): Promise<any> {
    return this.cardsService.getCardDeck();
  }

  @Get('/card/:id')
  async card(@Param() params): Promise<any> {
    return this.cardsService.getCard(params.id);
  }

  @Get('/shuffle/:id')
  async shuffleCards(@Param() params): Promise<any> {
    return this.cardsService.reshuffleCards(params.id);
  }
}
