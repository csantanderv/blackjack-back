import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class GameType {
  @Field()
  readonly dateGame: Date;
  @Field()
  readonly currentGame: boolean;
  @Field()
  readonly status: string;
}
