// Polyfill cho FinalizationRegistry nếu không được hỗ trợ
if (typeof FinalizationRegistry === 'undefined') {
  class FinalizationRegistryShim<T> {
    private _registrations: Map<T, Function> = new Map();

    constructor() {}

    register(value: T, cleanupCallback: Function): void {
      this._registrations.set(value, cleanupCallback);
    }

    unregister(value: T): void {
      this._registrations.delete(value);
    }
  }

  // Gán shim cho globalThis.FinalizationRegistry
  globalThis.FinalizationRegistry = FinalizationRegistryShim as any;
}

// Các import của Angular và các cấu hình khác
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

// Khởi tạo ứng dụng Angular SSR
const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
