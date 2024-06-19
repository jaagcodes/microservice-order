import { IsInt, IsOptional } from 'class-validator';

export class FindOrdersDto {
  @IsInt()
  @IsOptional()
  readonly page: number = 1;

  @IsInt()
  @IsOptional()
  readonly limit: number = 10;
}