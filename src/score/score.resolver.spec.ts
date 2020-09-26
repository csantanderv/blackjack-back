import { Test, TestingModule } from '@nestjs/testing';
import { ScoreResolver } from './score.resolver';

describe('ScoreResolver', () => {
  let resolver: ScoreResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScoreResolver],
    }).compile();

    resolver = module.get<ScoreResolver>(ScoreResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
