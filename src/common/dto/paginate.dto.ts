import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class PaginateDto {
  @IsOptional()
  @ApiPropertyOptional()
  limitPerPage: number;

  @IsOptional()
  @ApiPropertyOptional()
  currentPage: number;

  constructor() {
    this.limitPerPage = 10;
    this.currentPage = 1;
  }
}

export class BusinessSearchDto {
  @IsOptional()
  @ApiPropertyOptional()
  per_page: number;

  @IsOptional()
  @ApiPropertyOptional()
  page: number;

  @IsOptional()
  @ApiPropertyOptional()
  search: string;

  @IsOptional()
  @ApiPropertyOptional()
  status: string;

  constructor() {
    this.per_page = 10;
    this.page = 1;
  }
}
