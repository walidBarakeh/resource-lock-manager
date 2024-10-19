import { IsString, IsInt, Min } from 'class-validator';

export class TimeQueryDTO {
  constructor(resourceId: string, time: number) {
    this.resourceId = resourceId;
    this.time = time;
  }
  @IsString()
  resourceId: string;

  @IsInt()
  @Min(0)
  time: number;
}
