import { getTime } from './helpers';
import { Queue } from './decorators';


class Test {
  @Queue({ delay: 5000 })
  public method(a: string): Promise<string> {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve(a + a);
      }, 5000);
    });
  }

  @Queue()
  public method2(a: string): Promise<string> {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve(a + a + a);
      }, 5000);
    });
  }
}

const test = new Test();

function doTest2(str: string) {
  test.method2(str)
    .then((res) => {
      console.log(`2${getTime()} --${str} => ${res}`);
    })
    .catch((err) => {
      console.log(`2${getTime()} -- ${err}`);
    });
}

function doTest(str: string) {
  test.method(str)
    .then((res) => {
      console.log(`${getTime()} --${str} => ${res}`);
    })
    .catch((err) => {
      console.log(`${getTime()} -- ${err}`);
    });
}

console.log(`${getTime()} -- START!`);
setTimeout(() => {
  doTest('a');
  doTest2('b');
  doTest('d');
  doTest2('c');
  doTest('e');
  doTest('f');
}, 1000)
console.log(`${getTime()} -- FINISH!`);