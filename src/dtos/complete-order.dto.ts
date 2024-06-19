import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CompleteOrderDto {
  @ApiProperty({ description: 'The ID of the order' })
  @IsNotEmpty()
  @IsString()
  readonly orderId: string;

  @ApiProperty({ description: 'The ID of the recipe' })
  @IsNotEmpty()
  @IsString()
  readonly recipeId: string;

  @ApiProperty({ description: 'The name of the recipe' })
  @IsNotEmpty()
  @IsString()
  readonly recipeName: string;
}