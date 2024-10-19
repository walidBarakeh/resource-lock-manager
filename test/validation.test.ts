import { validate, ValidationError } from 'class-validator';
import { ResourceLockDTO, ResourcesDto } from '../src/dto/ResourceLockDTO';
import { plainToInstance } from 'class-transformer';

describe('ResourceLockDTO Validation', () => {
  it('should return an error if startTime is negative number', async () => {
    const dto = new ResourceLockDTO('a', -1, 1500);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('startTime');
    expect(errors[0].constraints?.min).toBe('startTime must not be less than 0');
  });

  it('should return an error if endTime is negative number', async () => {
    const dto = new ResourceLockDTO('a', 1, -1500);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('endTime');
    expect(errors[0].constraints?.min).toBe('endTime must not be less than 0');
    expect(errors[0].constraints?.isEndTimeGreaterThanStartTime).toBe('endTime must be greater than startTime');
  });
  it('should return an error if endTime is not greater than startTime', async () => {
    const dto = new ResourceLockDTO('a', 1600, 1500);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isEndTimeGreaterThanStartTime).toBe('endTime must be greater than startTime');
  });

  it('should pass validation if endTime is greater than startTime', async () => {
    const dto = new ResourceLockDTO('a', 1500, 1600);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });
  it('should return error if one element is invalid', async () => {
    const resources = [
      { resourceId: 'a', startTime: 1, endTime: 2 },
      { startTime: 10, endTime: 20 },
    ];
    const resourcesDto = plainToInstance(ResourcesDto, { resources });
    const errors = await validate(resourcesDto);

    expect(errors.length).toBe(1);
    const error = errors?.[0]?.children?.[0]?.children?.[0] as ValidationError;
    expect(error.property).toBe('resourceId');
    expect(error.constraints?.isString).toBe('resourceId must be a string');
  });
});
