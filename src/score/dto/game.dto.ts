import { Field, ID, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class GameType {
  @Field(()=> ID)
  readonly id?: string;
  @Field()
  readonly dateGame: Date;
  @Field()
  readonly currentGame: boolean;
  @Field()
  readonly status: string;
}
