import { HttpException, HttpStatus } from '@nestjs/common';
import { IServiceResponse } from '../interfaces/service.interface';
import { Response } from 'express';

export class HttpResponse {
  /**
   * Sends a successful HTTP response with optional data and meta information.
   *
   * @param {string} message - The message to include in the response.
   * @param {IServiceResponse<T, U>} data - Optional data and meta information to include in the response.
   * @param {Response} res - Optional Express Response object to send the response directly.
   * @returns {object | Response} - The formatted response object or the response sent directly if a Response object is provided.
   */
  static send<T = any, U = any>(
    message: string,
    data?: IServiceResponse<T, U>,
    res?: Response,
  ) {
    if (res) {
      return res.status(200).json({
        status: true,
        message,
        data: data && data.data ? data.data : undefined,
        meta: data && data.meta ? data.meta : undefined,
      });
    }
    return {
      status: true,
      message,
      data: data && data.data ? data.data : undefined,
      meta: data && data.meta ? data.meta : undefined,
    };
  }

  /**
   * Throws an HTTP exception with a structured error message and status code.
   *
   * @param {string} code - The HTTP status code (e.g., 'BAD_REQUEST', 'INTERNAL_SERVER_ERROR').
   * @param {string} message - The error message to include in the response.
   * @param {Record<string, unknown>} content - Additional content or data to include in the error response.
   * @throws {HttpException} - Throws an HTTP exception with the specified message and status code.
   */
  static error(
    code: string,
    message: string,
    content: Record<string, unknown>,
  ) {
    const data = {
      status: false,
      message,
      data: content,
    };
    throw new HttpException(data, HttpStatus[code]);
  }
}
