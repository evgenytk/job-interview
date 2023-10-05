import { Controller, Get, HttpCode } from 'routing-controllers';

@Controller('/status')
export class StatusController {
  // Used primarily for load balancing health check
  @HttpCode(200)
  @Get('/')
  async index(): Promise<string> {
    return 'OK';
  }
}
