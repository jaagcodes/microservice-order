import { IsNotEmpty, IsString } from 'class-validator';

export class CompleteOrderDto {
  @IsNotEmpty()
  @IsString()
  readonly orderId: string;

  @IsNotEmpty()
  @IsString()
  readonly recipeId: string;

  @IsNotEmpty()
  @IsString()
  readonly recipeName: string;
}