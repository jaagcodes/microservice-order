import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class PaginationQueryDto {
  @ApiProperty({ description: 'Page number', minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number;

  @ApiProperty({ description: 'Number of items per page', minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number;
}