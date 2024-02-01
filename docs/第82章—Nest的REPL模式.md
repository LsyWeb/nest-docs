我们写过很多 Module、Service、Controller，但这些都要服务跑起来之后在浏览器里访问对应的 url，通过 get 或者 post 的方式传参来测试。

这个还是挺麻烦的，能不能像 node 的 repl 那样，直接在控制台测试呢？

repl 是 read-eval-paint-loop，也就是这个：

![](./image/第82章—Nest的REPL模式-1.image#?w=566&h=482&s=51437&e=png&b=000000.png)

Nest 能不能这样来测试呢？

可以的，Nest 支持 repl 模式。

我们创建个 Nest 项目：

```
nest new repl-test
```

![](./image/第82章—Nest的REPL模式-2.image#?w=840&h=642&s=141942&e=png&b=010101.png)

然后创建两个模块：

![](./image/第82章—Nest的REPL模式-3.image#?w=926&h=1016&s=239764&e=png&b=191919.png)

把服务跑起来：

```
npm run start:dev
```
![](./image/第82章—Nest的REPL模式-4.image#?w=1704&h=994&s=451390&e=png&b=181818.png)

浏览器访问下：

![](./image/第82章—Nest的REPL模式-5.image#?w=600&h=182&s=19289&e=png&b=ffffff.png)

![](./image/第82章—Nest的REPL模式-6.image#?w=604&h=204&s=19983&e=png&b=ffffff.png)

我们前面都是这么测试接口的。

其实还可以用 repl 模式。

在 src 下创建个 repl.ts，写入如下内容：

```javascript
import { repl } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  await repl(AppModule);
}
bootstrap();
```
然后把服务停掉，通过这种方式跑：

```
npm run start:dev -- --entryFile repl
```

这里的 --entryFile 是指定入口文件是 repl.ts

前面带了个 -- 是指后面的参数不是传给 npm run start:dev 的，要原封不动保留。

也就是会传给 nest start

![](./image/第82章—Nest的REPL模式-7.image#?w=690&h=114&s=25838&e=png&b=202020.png)

当然，你直接执行 nest start 也可以：

```
nest start --watch --entryFile repl
```

跑起来后，执行 debug()，会打印所有的 module 和 module 下的 controllers 和 providers。

![](./image/第82章—Nest的REPL模式-8.image#?w=588&h=794&s=87297&e=png&b=181818.png)

而且，你可以 get() 来取对应的 providers 或者 controllers 调用：

![](./image/第82章—Nest的REPL模式-9.image#?w=1062&h=698&s=116051&e=png&b=1c1c1c.png)

get、post 方法都可以调用。

有的同学说，你这个 post 方法没有参数啊。

那我们加一些：

![](./image/第82章—Nest的REPL模式-10.image#?w=690&h=286&s=36309&e=png&b=1f1f1f.png)

然后添加 ValidationPipe：

![](./image/第82章—Nest的REPL模式-11.image#?w=1046&h=612&s=127403&e=png&b=1f1f1f.png)

安装校验相关的包：

```
npm install class-validator class-transformer
```

在 dto 添加约束：

```javascript
import { IsEmail, IsNotEmpty } from "class-validator";

export class CreateAaaDto {
    @IsNotEmpty()
    aaa: string;

    @IsEmail()
    bbb: string;
}
```

我们先正常跑下服务：

```
npm run start:dev
```
然后 postman 里测试下：

![](./image/第82章—Nest的REPL模式-12.image#?w=788&h=838&s=83951&e=png&b=fcfcfc.png)

可以看到，ValidationPipe 生效了。

那 repl 里是不是一样呢？

我们再跑下 repl 模式：

```
npm run start:dev -- --entryFile repl
```

可以看到，并没有触发 pipe：

![](./image/第82章—Nest的REPL模式-13.image#?w=1098&h=804&s=167939&e=png&b=1b1b1b.png)

也就是说，它只是单纯的传参调用这个函数，不会解析装饰器。

所以测试 controller 的话，repl 的方式是有一些限制的。

但是测试 service 很不错：

![](./image/第82章—Nest的REPL模式-14.image#?w=644&h=214&s=26237&e=png&b=181818.png)

比如测试某个项目的 UserService 的 login 方法：

![](./image/第82章—Nest的REPL模式-15.image#?w=1534&h=1422&s=336812&e=png&b=191919.png)

就很方便。

大概知道 repl 模式是做啥的之后，我们过一下常用的 api：

debug() 可以查看全部的 module 或者某个 module 下的 cotrollers、providers：

![](./image/第82章—Nest的REPL模式-16.image#?w=466&h=644&s=62438&e=png&b=181818.png)

![](./image/第82章—Nest的REPL模式-17.image#?w=426&h=296&s=28159&e=png&b=181818.png)

methods() 可以查看某个 controller 或者 provider 的方法：

![](./image/第82章—Nest的REPL模式-18.image#?w=530&h=338&s=27089&e=png&b=181818.png)

get() 或者 $() 可以拿到某个 controller 或者 provider 调用它的方法：

![](./image/第82章—Nest的REPL模式-19.image#?w=800&h=288&s=40856&e=png&b=181818.png)

常用的 api 就这些。

此外，按住上下键可以在历史命令中导航：

![](./image/第82章—Nest的REPL模式-20.image#?w=1234&h=718&s=96689&e=gif&f=26&b=191919.png)

但有个问题。

当你重新跑之后，这些命令历史就消失了，再按上下键也没有历史。

可以改一下 repl.ts：

```javascript
import { repl } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const replServer = await repl(AppModule);
    replServer.setupHistory(".nestjs_repl_history", (err) => {
        if (err) {
            console.error(err);
        }
    });
}
bootstrap();

```
再跑的时候也是有历史的：

![](./image/第82章—Nest的REPL模式-21.image#?w=1572&h=764&s=319655&e=gif&f=42&b=191919.png)

其实就是 nest 会把历史命令写入文件里，下一次跑就可以用它恢复历史了：

![](./image/第82章—Nest的REPL模式-22.image#?w=482&h=272&s=27250&e=png&b=1f1f1f.png)

你还可以把这个命令配到 npm scripts 里：

![](./image/第82章—Nest的REPL模式-23.image#?w=924&h=114&s=25935&e=png&b=202020.png)

然后直接 npm run repl:dev 来跑。

案例代码上传了[小册仓库](https://github.com/QuarkGluonPlasma/nestjs-course-code/tree/main/repl-login)。

## 总结

这节我们学了 nest 的 repl 模式。

repl 模式下可以直接调用 controller 或者 provider 的方法，但是它们并不会触发 pipe、interceptor 等，只是传参测试函数。

可以使用 debug() 拿到 module、controller、provider 的信息，methods() 拿到方法，然后 get() 或者 $() 拿到 controller、provider 然后调用。

repl 模式对于测试 service 或者 contoller 的功能还是很有用的。
