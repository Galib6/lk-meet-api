import { INestApplication } from '@nestjs/common';
import { SocketStateAdapter } from './shared/socket-state/socket-state.adapter';
import { SocketStateService } from './shared/socket-state/socket-state.service';

export const initSocketAdapters = (app: INestApplication): INestApplication => {
  const socketStateService = app.get(SocketStateService);

  app.useWebSocketAdapter(new SocketStateAdapter(app, socketStateService));

  return app;
};
