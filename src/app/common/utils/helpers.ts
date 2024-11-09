import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Helpers {
    public static getPathFromUrl(url: string): string {
        return new URL(url).pathname;
    }
}
