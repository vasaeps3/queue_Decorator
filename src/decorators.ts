import { Subject, from, of, combineLatest } from 'rxjs';
import { concatMap, debounceTime } from 'rxjs/operators';


export interface IQueueParams {
  delay?: number;
}
export function Queue(params?: IQueueParams): MethodDecorator {

  return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const sequencePromise = new Subject<[IArguments, any]>();
    const outputPromise = new Subject<[IArguments, any]>();
    const originalMethod = descriptor.value;

    sequencePromise.pipe(
      concatMap(([args, self]) => {
        return combineLatest(from(originalMethod.apply(self, args)), of(args));
      }),
      debounceTime(params && params.delay || 0)
    ).subscribe(([res, args]) => outputPromise.next([res, args]));

    descriptor.value = function () {
      const orArguments = arguments;
      sequencePromise.next([arguments, this]);
      return new Promise((resolve) => {
        outputPromise.subscribe(([res, args]) => {
          if (args === orArguments) {
            resolve(res);
          }
        });
      });
    }

    return descriptor;
  }
}