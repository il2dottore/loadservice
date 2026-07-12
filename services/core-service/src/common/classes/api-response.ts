export class ApiResponse<TData = unknown> {
  success!: boolean;
  message!: string;
  httpCode!: number;
  data!: TData | [];

  constructor(
    success: boolean,
    message: string,
    httpCode: number,
    data: TData | [],
  ) {
    this.success = success;
    this.message = message;
    this.httpCode = httpCode;
    this.data = data;
  }
}
