import { IsString, IsInt, Min } from 'class-validator';
import { IsValueGreaterThanOther } from '../validators/numberComparison';

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
