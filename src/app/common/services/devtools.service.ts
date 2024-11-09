import { Injectable, NgZone, OnDestroy, OnInit } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DevtoolsService implements OnInit, OnDestroy {
  private devToolsOpened = false;
  private intervalId: any;

  constructor(private ngZone: NgZone) {}

  ngOnInit(): void {
    this.initDevtoolsDetection();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);  // Clear the interval when service is destroyed
    }
  }

  // Initialize the detection logic
  initDevtoolsDetection(): void {
    this.detectDevTools(); // Run detection on app load

    // Continuously check if DevTools is opened
    this.intervalId = setInterval(() => {
      this.ngZone.runOutsideAngular(() => {
        this.detectDevTools();
      });
    }, 1000);  // Check every second
  }

  // Function to detect if DevTools is open using `console.log` behavior
  private detectDevTools(): void {
    const devtools = /./;
    devtools.toString = () => {
      // If DevTools is open, the toString method is triggered
      if (!this.devToolsOpened) {
        this.devToolsOpened = true;
        this.clearConsoleAndWarn(); // DevTools just opened, take action
        this.stopDetection(); // Stop further detection and logging
      }
      return '';
    };
    console.log('%c', devtools); // This triggers toString when DevTools is open
  }

  // Function to clear console and show custom warning
  private clearConsoleAndWarn(): void {
    console.clear();

    // Display the message in both Vietnamese and English with improved styling and icons
    const icon = '⚠️'; // You can replace this with a different Unicode icon if needed
    const iconPerson = '🙋';

    // Display header
    console.log(`%c${iconPerson}  Unicourse - Nền tảng học tập trực tuyến`, 'color: #1E90FF; font-size: 20px; font-weight: bold; padding: 10px 0;');
    
    // Vietnamese version
    console.log(
      `%c${iconPerson} Xin chào các bạn \nUnicourse là nền tảng học tập trực tuyến cung cấp các khóa học chuyên nghiệp phù hợp với sinh viên và người đi làm. Các khóa học bao gồm React, Angular, Tiếng Trung, Tiếng Nhật và nhiều hơn nữa.\n- Để hợp tác với chúng tôi, vui lòng truy cập: %chttps://unicourse.vn/contact\n\n%c${icon} Cảnh báo \nMọi hành vi sao chép hoặc đăng tải lại video từ nền tảng này mà không được phép sẽ bị xử lý theo pháp luật.`,
      'font-size: 16px; color: white; line-height: 1.5rem;',
      'font-size: 16px; color: #1E90FF; text-decoration: underline;',
      'font-size: 16px; color: #FF6347;  line-height: 1.5rem;'
    );
    
    // English version
    console.log(
      `%c${iconPerson} Hello \nUnicourse is an online learning platform that provides professional courses tailored for students and working professionals. Our courses include React, Angular, Chinese, Japanese, and much more.\n- If you wish to collaborate with us, please visit: %chttps://unicourse.vn/contact\n\n%c${icon} Warning \nAny act of copying or re-uploading videos from this platform without permission will be subject to legal action.`,
      'font-size: 16px; color: white; line-height: 1.5rem;',
      'font-size: 16px; color: #1E90FF; text-decoration: underline;',
      'font-size: 16px; color: #FF6347;  line-height: 1.5rem;'
    );

    // Block future `console.log` calls after the first detection
    this.blockConsoleLogging();
  }

  // Function to block future console.log calls
  private blockConsoleLogging(): void {
    console.log = function () {};
  }

  // Stop detection by clearing the interval
  private stopDetection(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);  // Stop the interval after detecting once
      this.intervalId = null;
    }
  }
}