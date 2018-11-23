import { Subject, } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';


export interface IQueueParams {
  delay?: number;
  maxFlow?: number;
}
export function Queue(params?: IQueueParams): MethodDecorator {

  return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    let countPromises = 0;
    const sequencePromise = new Subject<[IArguments, any]>();
    const outputPromise = new Subject<[IArguments, any]>();
    const originalMethod = descriptor.value;

    sequencePromise
      .pipe(
        concatMap(([args, self]) =>
          new Promise((resolve, reject) => {
            if (params && params.maxFlow < countPromises) {
              reject('Too many flows!');
            }
            setTimeout(() => resolve(), !!countPromises && params && params.delay || 0);
          })
            .then(() => originalMethod.apply(self, args)
              .then((res: any) => { outputPromise.next([args, res]); })
            )
        ),
        tap(() => { --countPromises; }),
      )
      .subscribe();

    descriptor.value = function () {
      const orArguments = arguments;
      sequencePromise.next([arguments, this]);
      ++countPromises;
      return new Promise((resolve) => {
        outputPromise
          .subscribe(([args, res]) => {
            if (args === orArguments) {
              resolve(res);
            }
          });
      });
    }

    return descriptor;
  }
}