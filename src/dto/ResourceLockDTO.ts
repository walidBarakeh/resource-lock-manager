import 'reflect-metadata';
import { IsString, IsInt, Min, IsArray, ValidateNested } from 'class-validator';
import { IsValueGreaterThanOther } from '../validators/numberComparison';
import { Type } from 'class-transformer';

export class ResourceLockDTO {
  constructor(resourceId: string, startTime: number, endTime: number) {
    this.resourceId = resourceId;
    this.startTime = startTime;
    this.endTime = endTime;
  }

  @IsString()
  resourceId!: string;

  @IsInt()
  @Min(0)
  startTime!: number;

  @IsInt()
  @Min(0)
  @IsValueGreaterThanOther('startTime', 'isEndTimeGreaterThanStartTime', {
    message: 'endTime must be greater than startTime',
  })
  endTime!: number;
}

export class ResourcesDto {
  constructor(resources: ResourceLockDTO[]) {
    this.resources = resources;
  }

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourceLockDTO)
  resources: ResourceLockDTO[];
}

export class ResourceLockArrayDTO {
  constructor(resources: Resource[]) {
    this.resources = resources;
  }
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResourceLockDTO)
  resources!: ResourceLockDTO[];
}

type Resource = {
  resourceId: string;
  startTime: number;
  endTime: number;
};
