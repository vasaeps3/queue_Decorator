import {Subject, } from 'rxjs';
import {concatMap, tap} from 'rxjs/operators';


export interface IQueueParams {
  delay?: number;
  maxFlow?: number;
}

export function Queue({delay = 0, maxFlow = Number.MAX_VALUE}: IQueueParams = {}): MethodDecorator {

  return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    let countPromises = 0;
    const sequencePromise = new Subject<[IArguments, any]>();
    const outputPromise = new Subject<[IArguments, any]>();
    const originalMethod = descriptor.value;

    sequencePromise
      .pipe(
        concatMap(async ([args, self]: [IArguments, any]) => {
          await new Promise((resolve, reject) => {
            if (maxFlow < countPromises) {
              reject(new Error('Too many flows!'));
            }

            if (countPromises && delay) {
              setTimeout(
                () => {
                  resolve();
                },
                delay
              );
            } else {
              resolve();
            }
          });
            
          outputPromise.next([args, originalMethod.apply(self, args)]);
        }),
        tap(() => {
          countPromises--;
        }),
      )
      .subscribe();

    descriptor.value = function () {
      const orArguments = arguments;
      sequencePromise.next([arguments, this]);
      ++countPromises;

      return new Promise((resolve) => {
        outputPromise
          .subscribe(([args, res]: [IArguments, any]) => {
            if (args === orArguments) {
              resolve(res);
            }
          });
      });
    }

    return descriptor;
  }
}