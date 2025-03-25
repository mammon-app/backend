/**
 * Interface representing a service response with optional data and metadata.
 * @template T The type of data in the response.
 * @template U The type of metadata in the response.
 */
export interface IServiceResponse<T = any, U = any> {
  /**
   * Optional data payload in the service response.
   */
  data?: T;

  /**
   * Optional metadata in the service response.
   * This can include additional information related to the data.
   */
  meta?: U;
}
