import { validate } from 'class-validator';
import { ResourceLockDTO } from '../src/dto/ResourceLockDTO';

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
});
