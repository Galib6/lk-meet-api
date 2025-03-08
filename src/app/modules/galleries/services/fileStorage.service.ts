import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from '@src/app/base/base.service';
import { Repository } from 'typeorm';
import { FileStorage } from '../entities/fileStorage.entity';

@Injectable()
export class FileStorageService extends BaseService<FileStorage> {
  constructor(
    @InjectRepository(FileStorage)
    public readonly _repo: Repository<FileStorage>
  ) {
    super(_repo);
  }
}
