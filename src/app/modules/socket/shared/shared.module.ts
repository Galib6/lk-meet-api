import { Global, Module } from '@nestjs/common';

import { SocketStateModule } from './socket-state/socket-state.module';

@Global()
@Module({
  imports: [SocketStateModule],
  exports: [SocketStateModule],
})
export class SharedModule {}
