import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { plainToInstance, type ClassConstructor } from 'class-transformer';
import { validate } from 'class-validator';

function shouldSkipValidation(metatype?: ClassConstructor<object>): boolean {
  if (!metatype) return true;
  return [String, Boolean, Number, Array, Object].includes(
    metatype as unknown as typeof String,
  );
}

@Injectable()
export class GlobalValidationPipe implements PipeTransform {
  async transform(
    value: unknown,
    metadata: ArgumentMetadata,
  ): Promise<unknown> {
    const metatype = metadata.metatype as ClassConstructor<object> | undefined;

    if (shouldSkipValidation(metatype)) {
      return value;
    }

    const targetType = metatype as ClassConstructor<object>;
    const object = plainToInstance(targetType, value);
    const errors = await validate(object, { skipMissingProperties: false });

    if (errors.length > 0) {
      const errorMessages = errors
        .map((error) => Object.values(error.constraints || {}).join(', '))
        .join('; ');

      throw new BadRequestException({
        statusCode: 400,
        message: 'Validation failed',
        errors: errorMessages,
      });
    }

    return object;
  }
}
