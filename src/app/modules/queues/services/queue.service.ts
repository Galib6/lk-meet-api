import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";

import { queuesConstants } from "../constants";

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(queuesConstants.defaultQueue.name)
    private readonly pdfQueue: Queue
  ) {}

  async createBulkCountryPurVisaCatDoc(data: any) {
    return await this.pdfQueue.add(
      queuesConstants.defaultQueue.jobNames.createOne,
      data
    );
  }

  async updateBulkCountryPurVisaCatDoc(data: any) {
    return await this.pdfQueue.add(
      queuesConstants.defaultQueue.jobNames.updateOne,
      data
    );
  }
}
