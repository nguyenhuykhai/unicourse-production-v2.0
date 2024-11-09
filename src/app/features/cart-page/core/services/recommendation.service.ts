import { Injectable } from '@angular/core';
import { RecommendationItem } from '../models';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  // id: string;
  // title: string;
  // author: string;
  // rating: number;
  // reviews: number;
  // price: number;
  // vnprice: number;
  // totalCourse: number;
  // image: string;
  private recommendations: RecommendationItem[] = [
    {
      id: 'CSI104',
      title: 'Khóa học CSI104',
      author: 'thầy Uni Cóc',
      rating: 4.8,
      reviews: 46,
      price: 199,
      vnprice: 199000,
      totalCourse: 20,
      image: 'https://firebasestorage.googleapis.com/v0/b/unicourse-f4020.appspot.com/o/Course%2F10.png?alt=media&token=f01b860d-1113-40a8-bb1b-881b431ae617'
    },
    {
      id: 'PRO192',
      title: 'Khóa học PRO192',
      author: 'thầy Uni Cóc',
      rating: 4.8,
      reviews: 40,
      price: 0,
      vnprice: 0,
      totalCourse: 28,
      image: 'https://firebasestorage.googleapis.com/v0/b/unicourse-f4020.appspot.com/o/Course%2F7.png?alt=media&token=1b474e48-eb4a-4ac7-8946-6291cb8c77d7'
    },
    {
      id: 'MAE101',
      title: 'Khóa học MAE101',
      author: 'thầy Uni Cóc',
      rating: 4.6,
      reviews: 55,
      price: 0,
      vnprice: 0,
      totalCourse: 25,
      image: 'https://firebasestorage.googleapis.com/v0/b/unicourse-f4020.appspot.com/o/Course%2F9.png?alt=media&token=9296c66b-405d-43dd-b125-8b11bdb33988'
    },
    {
      id: 'OSG202',
      title: 'Khóa học OSG202',
      author: 'thầy Uni Cóc',
      rating: 4.7,
      reviews: 44,
      price: 199,
      vnprice: 199000,
      totalCourse: 12,
      image: 'https://firebasestorage.googleapis.com/v0/b/unicourse-f4020.appspot.com/o/Course%2F5.png?alt=media&token=be2986ca-f801-429a-afb3-71be86d25db9'
    }
    // new RecommendationItem('CSI104', 'Khóa học CSI104', 'thầy Uni Cóc', 4.8, 46, 199, 199000, 20, 'https://firebasestorage.googleapis.com/v0/b/unicourse-f4020.appspot.com/o/Course%2F10.png?alt=media&token=f01b860d-1113-40a8-bb1b-881b431ae617'),
    // new RecommendationItem('PRO192', 'Khóa học PRO192', 'thầy Uni Cóc', 4.8, 40, 0, 0, 28, 'https://firebasestorage.googleapis.com/v0/b/unicourse-f4020.appspot.com/o/Course%2F7.png?alt=media&token=1b474e48-eb4a-4ac7-8946-6291cb8c77d7'),
    // new RecommendationItem('MAE101', 'Khóa học MAE101', 'thầy Uni Cóc', 4.6, 55, 0, 0, 25, 'https://firebasestorage.googleapis.com/v0/b/unicourse-f4020.appspot.com/o/Course%2F9.png?alt=media&token=9296c66b-405d-43dd-b125-8b11bdb33988'),
    // new RecommendationItem('OSG202', 'Khóa học OSG202', 'thầy Uni Cóc', 4.7, 44, 199, 199000, 12, 'https://firebasestorage.googleapis.com/v0/b/unicourse-f4020.appspot.com/o/Course%2F5.png?alt=media&token=be2986ca-f801-429a-afb3-71be86d25db9'),
  ];

  getRecommendations() {
    return this.recommendations;
  }
}