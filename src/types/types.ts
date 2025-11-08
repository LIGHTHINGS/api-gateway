
export type ExtractRestanaTypes<T extends (...args: any) => any> = {
  Request: Parameters<ReturnType<T>['get']>[0];
  Response: Parameters<ReturnType<T>['get']>[1];
  Next: Parameters<ReturnType<T>['get']>[2];
};
