import { Subject, from, of, combineLatest } from 'rxjs';
import { concatMap } from 'rxjs/operators';

export function Queue(): MethodDecorator {

  return function (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const sequencePromise = new Subject<[IArguments, any]>();
    const outputPromise = new Subject<[IArguments, any]>();
    const originalMethod = descriptor.value;

    sequencePromise.pipe(
      concatMap(([args, self]) => {
        return combineLatest(from(originalMethod.apply(self, args)), of(args));
      })
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