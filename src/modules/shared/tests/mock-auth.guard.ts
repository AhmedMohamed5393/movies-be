import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Inject mock user ID
    const request = context.switchToHttp().getRequest();
    request.user = { id: 'test-user-id' };
    return true;
  }
}
