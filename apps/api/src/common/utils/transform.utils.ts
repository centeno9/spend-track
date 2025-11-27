import {
  ClassConstructor,
  ClassTransformOptions,
  plainToInstance,
} from 'class-transformer';

export function mapToDto<T, U>(
  cls: ClassConstructor<T>,
  data: U,
  options?: ClassTransformOptions,
) {
  return plainToInstance(cls, data, options);
}

export function getPaginationData(
  currentPage: number,
  limit: number,
  totalData: number,
) {
  return {
    currentPage,
    pageSize: limit,
    totalPages: Math.ceil(totalData / limit),
    totalResults: totalData,
  };
}
