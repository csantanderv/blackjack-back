import { Resolver, Query } from '@nestjs/graphql';
import { ScoreService } from './score.service';
import { GameType } from './dto/game.dto';

@Resolver('Score')
export class ScoreResolver {
  constructor(private readonly scoreService: ScoreService) {}
  @Query(() => [GameType])
  async games(): Promise<GameType[]> {
    return this.scoreService.getGames();
  }
}
