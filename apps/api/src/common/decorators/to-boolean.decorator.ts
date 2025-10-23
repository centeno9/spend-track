import { Transform, TransformFnParams } from 'class-transformer';

export function ToBoolean() {
  return Transform(({ value }: TransformFnParams) => {
    if (value === 'true' || value === 1 || value === true) {
      return true;
    }
    if (value === 'false' || value === 0 || value === false) {
      return false;
    }
    return value;
  });
}
