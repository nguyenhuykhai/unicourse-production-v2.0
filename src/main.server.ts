// Kiểm tra và tạo đối tượng global nếu chưa tồn tại
if (typeof global === 'undefined') {
  globalThis.global = globalThis;
}

// Các import của Angular và các cấu hình khác
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';

// Khởi tạo ứng dụng Angular SSR
const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;