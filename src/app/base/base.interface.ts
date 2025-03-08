import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { IFindByIdBaseOptions } from "../interfaces";
import { GenericObject, SuccessResponse } from "../types";
import { IFindAllBaseOptions } from "./../interfaces/queryOptions.interfaces";

export interface IBaseService<T> {
  findByIdBase(id: number, options?: IFindByIdBaseOptions): Promise<T>;

  isExist(filters: GenericObject): Promise<T>;

  findOneBase(
    filters: GenericObject,
    options?: IFindByIdBaseOptions
  ): Promise<T>;

  findAllBase(
    filters: GenericObject,
    options?: IFindAllBaseOptions
  ): Promise<SuccessResponse | T[]>;

  createOneBase(data: T, options?: IFindByIdBaseOptions): Promise<T>;

  updateOneBase(
    id: number,
    data: QueryDeepPartialEntity<T>,
    options?: IFindByIdBaseOptions
  ): Promise<T>;

  deleteOneBase(id: number): Promise<SuccessResponse>;

  softDeleteOneBase(id: number): Promise<SuccessResponse>;

  recoverByIdBase(id: number, options?: IFindByIdBaseOptions): Promise<T>;
}
