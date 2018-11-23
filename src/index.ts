import { getTime } from './helpers';
import { Queue } from './decorators';


class Test {
  // @Queue()
  public method(a: string): Promise<string> {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve(a + a);
      }, 1000);
    });
  }

  @Queue()
  public method2(a: string): Promise<string> {
    return new Promise<string>((resolve) => {
      console.log(`${a} start public method2`);
      setTimeout(() => {
        console.log(`${a} finish public method2`);
        resolve(a + a + a);
      }, 2000);
    });
  }
}

const test = new Test();

function doTest(str: string) {
  test.method2(str)
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
  doTest('b');
  doTest('d');
  doTest('c');
  doTest('e');
  doTest('f');
}, 1000)
console.log(`${getTime()} -- FINISH!`);