import { BaseEntity } from '@src/app/base';
import { ENUM_TABLE_NAMES } from '@src/shared';
import { Column, Entity } from 'typeorm';

@Entity(ENUM_TABLE_NAMES.FILE_STORAGES, { orderBy: { createdAt: 'DESC' } })
export class FileStorage extends BaseEntity {
  public static readonly SEARCH_TERMS: string[] = [];

  @Column({ length: 50 })
  storageType?: string;

  @Column({ length: 100 })
  fileType?: string;

  @Column({ length: 256 })
  folder?: string;

  @Column({ length: 256 })
  fileName?: string;

  @Column({ length: 256, nullable: true })
  link?: string;

  constructor() {
    super();
  }
}
