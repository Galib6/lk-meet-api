import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "@src/app/base/base.service";
import { DataSource, Repository } from "typeorm";
import { MeetingSessionUser } from "../entities/meetingSessionUser.entity";

@Injectable()
export class MeetingSessionUserService extends BaseService<MeetingSessionUser> {
  constructor(
    @InjectRepository(MeetingSessionUser)
    public readonly _repo: Repository<MeetingSessionUser>,
    private readonly dataSource: DataSource
  ) {
    super(_repo);
  }
}
