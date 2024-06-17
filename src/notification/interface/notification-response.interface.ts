export interface NotificationResponse<T> {
    statusCode: number;
    message: string;
    data: T;
  }
  