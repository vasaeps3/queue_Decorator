import { getTime } from './helpers';
import { Queue } from './decorators';


class Test {
  @Queue({ delay: 5000, maxFlow: 5 })
  public method(a: string): Promise<string> {

    return new Promise<string>((resolve) => {
      console.log(`${getTime()} -- Started request with arguments => ${a}`);
      setTimeout(() => {
        console.log(`${getTime()} -- Have resolved with arguments=> ${a}`);
        resolve(a + a);
      }, 2000);
    });
  }

  @Queue()
  public method2(a: string): Promise<string> {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve(a + a + a);
      }, 2000);
    });
  }
}

const test = new Test();

function doTest2(str: string) {
  test.method2(str)
    .then((res) => {
      console.log(`${getTime()} --${str} => ${res}`);
    })
    .catch((err) => {
      console.log(`${getTime()} -- ${err}`);
    });
}

function doTest(str: string) {
  test.method(str)
    .then((res) => {
      console.log(`${getTime()} -- ${str} => ${res}`);
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
}, 1000)
setTimeout(() => {
  doTest('e');
  doTest('f');
  doTest('j');
  doTest('k');
}, 3100)