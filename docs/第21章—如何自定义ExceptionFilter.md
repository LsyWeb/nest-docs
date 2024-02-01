Exception Filter 是在 Nest 应用抛异常的时候，捕获它并返回一个对应的响应。

比如路由找不到时返回 404：

![](./image/第21章—如何自定义ExceptionFilter-1.image#?w=598&h=300&s=33718&e=png&b=fdfdfd.png)

服务端报错时返回 500：

![](./image/第21章—如何自定义ExceptionFilter-2.image#?w=540&h=296&s=29295&e=png&b=fdfdfd.png)

参数的错误返回 400：

![](./image/第21章—如何自定义ExceptionFilter-3.image#?w=494&h=304&s=32943&e=png&b=fdfdfd.png)

这些都是 Exception Filter 做的事情。

那么，如果我们想自定义异常时返回的响应格式呢？

这种就要自定义 Exception Filter 了。

创建个 nest 项目：

```
nest new exception-filter-test
```
![](./image/第21章—如何自定义ExceptionFilter-4.image#?w=970&h=684&s=168165&e=png&b=010101.png)

把它跑起来：

```
npm run start:dev
```

![](./image/第21章—如何自定义ExceptionFilter-5.image#?w=1526&h=334&s=115093&e=png&b=181818.png)

浏览器访问 http://localhost:3000 可以看到 hello world，代表服务跑起来了：

![](./image/第21章—如何自定义ExceptionFilter-6.image#?w=550&h=170&s=15840&e=png&b=ffffff.png)

然后在 controller 里抛个异常： 

![](./image/第21章—如何自定义ExceptionFilter-7.image#?w=994&h=486&s=112600&e=png&b=202020.png)

```javascript
throw new HttpException('xxxx', HttpStatus.BAD_REQUEST)
```
这个 HttpStatus 就是一些状态码的常量：

![](./image/第21章—如何自定义ExceptionFilter-8.image#?w=1110&h=524&s=171231&e=gif&f=34&b=222222.png)

这时候刷新页面，返回的就是 400 对应的响应：

![](./image/第21章—如何自定义ExceptionFilter-9.image#?w=600&h=280&s=25680&e=png&b=fdfdfd.png)

这个响应的格式是内置的 Exception Filter 生成的。

当然，你也可以直接抛具体的异常：

![](./image/第21章—如何自定义ExceptionFilter-10.image#?w=918&h=248&s=48310&e=png&b=1f1f1f.png)

![](./image/第21章—如何自定义ExceptionFilter-11.image#?w=582&h=314&s=31111&e=png&b=fdfdfd.png)

然后我们自己定义个 exception filter：

```
nest g filter hello --flat --no-spec
```

--flat 是不生成 hello 目录，--no-spec 是不生成测试文件。

![](./image/第21章—如何自定义ExceptionFilter-12.image#?w=670&h=70&s=17647&e=png&b=191919.png)

![](./image/第21章—如何自定义ExceptionFilter-13.image#?w=1172&h=284&s=62603&e=png&b=1f1f1f.png)

@Catch 指定要捕获的异常，这里指定 BadRequestException。


```javascript
import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from '@nestjs/common';

@Catch(BadRequestException)
export class HelloFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    debugger;
  }
}
```
先打个断点。

在 AppModule 里引入：

![](./image/第21章—如何自定义ExceptionFilter-14.image#?w=846&h=484&s=93395&e=png&b=1f1f1f.png)

```javascript
app.useGlobalFilters(new HelloFilter());
```
如果你想局部启用，可以加在 handler 或者 controller 上：

![](./image/第21章—如何自定义ExceptionFilter-15.image#?w=504&h=182&s=30353&e=png&b=1f1f1f.png)

![](./image/第21章—如何自定义ExceptionFilter-16.image#?w=490&h=150&s=25435&e=png&b=1f1f1f.png)

然后新建个调试配置文件：

![](./image/第21章—如何自定义ExceptionFilter-17.image#?w=640&h=390&s=45127&e=png&b=181818.png)

输入调试配置：

![](./image/第21章—如何自定义ExceptionFilter-18.image#?w=872&h=840&s=116234&e=png&b=1f1f1f.png)

```json
{
    "type": "node",
    "request": "launch",
    "name": "debug nest",
    "runtimeExecutable": "npm",
    "args": [
        "run",
        "start:dev",
    ],
    "skipFiles": [
        "<node_internals>/**"
    ],
    "console": "integratedTerminal",
}
```
把之前的服务关掉，点击调试启动：

![](./image/第21章—如何自定义ExceptionFilter-19.image#?w=1324&h=852&s=176647&e=png&b=1c1c1c.png)

刷新页面，代码会在断点处断住：

![](./image/第21章—如何自定义ExceptionFilter-20.image#?w=1598&h=858&s=238183&e=png&b=1d1d1d.png)

我们只要根据异常信息返回对应的响应就可以了：

![](./image/第21章—如何自定义ExceptionFilter-21.image#?w=1076&h=540&s=129790&e=png&b=202020.png)

```javascript
import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class HelloFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();

    const statusCode = exception.getStatus();

    response.status(statusCode).json({
       code: statusCode,
       message: exception.message,
       error: 'Bad Request',
       xxx: 111
    })
  }
}

```
这样，抛异常时返回的响应就是自定义的了：

![](./image/第21章—如何自定义ExceptionFilter-22.image#?w=550&h=356&s=32092&e=png&b=fdfdfd.png)

但我们只是 @Catch 了 BadRequestException

如果抛的是其他异常，依然是原来的格式：

![](./image/第21章—如何自定义ExceptionFilter-23.image#?w=904&h=226&s=47330&e=png&b=1f1f1f.png)

比如我抛一个 BadGatewayException。

![](./image/第21章—如何自定义ExceptionFilter-24.image#?w=570&h=304&s=30168&e=png&b=fdfdfd.png)

依然是默认格式。

那我们只要 @Catch 指定 HttpException 不就行了？

因为 BadRequestExeption、BadGateWayException 等都是它的子类。

![](./image/第21章—如何自定义ExceptionFilter-25.image#?w=920&h=740&s=150347&e=png&b=1f1f1f.png)

试一下：

![](./image/第21章—如何自定义ExceptionFilter-26.image#?w=574&h=344&s=31776&e=png&b=fdfdfd.png)

![](./image/第21章—如何自定义ExceptionFilter-27.image#?w=538&h=344&s=31635&e=png&b=fdfdfd.png)

确实，现在所有的 HttpException 都会被处理了。

但其实这也有个问题。

就是当我们用了 ValidationPipe 的时候。

比如我们加一个路由：

```javascript
@Post('aaa') 
aaa(@Body() aaaDto: AaaDto ){
    return 'success';
}
```
然后创建 src/aaa.dto.ts

```javascript
export class AaaDto {
    aaa: string;
    
    bbb: number;
}
```
安装用到的包：

```
npm install --save class-validator class-transformer
```
然后给 AaaDto 添加几个校验规则：

```javascript
import { IsEmail, IsNotEmpty, IsNumber } from "class-validator";

export class AaaDto {
    @IsNotEmpty({message: 'aaa 不能为空'})
    @IsEmail({}, {message: 'aaa 不是邮箱格式'})
    aaa: string;
    
    @IsNumber({}, {message: 'bbb 不是数字'})
    @IsNotEmpty({message: 'bbb 不能为空'})
    bbb: number;
}
```
在 main.ts 启用 ValidationPipe：

![](./image/第21章—如何自定义ExceptionFilter-28.image#?w=866&h=608&s=122015&e=png&b=1f1f1f.png)

```javascript
app.useGlobalPipes(new ValidationPipe());
```

在 postman 里测试下：

![](./image/第21章—如何自定义ExceptionFilter-29.image#?w=914&h=818&s=82850&e=png&b=fcfcfc.png)

可以看到，提示的错误也不对了。

因为我们自定义的 exception filter 会拦截所有 HttpException，但是没有对这种情况做支持。

![](./image/第21章—如何自定义ExceptionFilter-30.image#?w=872&h=620&s=123385&e=png&b=1f1f1f.png)

先不加这个 filter。

这时候响应是这样的：

![](./image/第21章—如何自定义ExceptionFilter-31.image#?w=880&h=894&s=90951&e=png&b=fcfcfc.png)

我们对这种情况做下支持：

![](./image/第21章—如何自定义ExceptionFilter-32.image#?w=886&h=590&s=121580&e=png&b=1f1f1f.png)

启用自定义的 filter，然后打个断点：

![](./image/第21章—如何自定义ExceptionFilter-33.image#?w=1036&h=594&s=122550&e=png&b=1f1f1f.png)

再次访问会在断点处断住：

![](./image/第21章—如何自定义ExceptionFilter-34.image#?w=1036&h=598&s=151151&e=png&b=202020.png)

可以看到 ValidationPipe 的 response 格式是这样的。

所以我们可以这样改：

![](./image/第21章—如何自定义ExceptionFilter-35.image#?w=1310&h=738&s=172236&e=png&b=1f1f1f.png)

```javascript
import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HelloFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();

    const statusCode = exception.getStatus();

    const res = exception.getResponse() as { message: string[] };
    
    response.status(statusCode).json({
       code: statusCode,
       message: res?.message?.join ? res?.message?.join(',') : exception.message,
       error: 'Bad Request',
       xxx: 111
    })
  }
}
```

如果 response.message 是个数组，就返回 join 的结果，否则还是返回 exception.message

再试下：

![](./image/第21章—如何自定义ExceptionFilter-36.image#?w=950&h=806&s=87413&e=png&b=fcfcfc.png)

![](./image/第21章—如何自定义ExceptionFilter-37.image#?w=554&h=326&s=31640&e=png&b=fdfdfd.png)

现在，ValidationPipe 的错误和其他的错误就都返回了正确的格式。

那如果我想在 Filter 里注入 AppService 呢？

这就需要改一下注册方式：

![](./image/第21章—如何自定义ExceptionFilter-38.image#?w=896&h=600&s=123262&e=png&b=1f1f1f.png)

不用 useGlobalFilters 注册了，而是在 AppModule 里注册一个 token 为 APP_FILTER 的 provider：

![](./image/第21章—如何自定义ExceptionFilter-39.image#?w=876&h=718&s=125118&e=png&b=1f1f1f.png)

```javascript
{
  provide: APP_FILTER,
  useClass: HelloFilter
}
```
Nest 会把所有 token 为 APP_FILTER 的 provider 注册为全局 Exception Filter。

注册多个 Filter 也是这么写。

其余的全局 Guard、Interceptor、Pipe 也是这样注册：

![](./image/第21章—如何自定义ExceptionFilter-40.image#?w=578&h=222&s=28288&e=png&b=222222.png)

这样注册的好处就是可以注入其他 provider 了：

比如我注入了 AppService，然后调用它的 getHello 方法：

![](./image/第21章—如何自定义ExceptionFilter-41.image#?w=1228&h=984&s=218038&e=png&b=1f1f1f.png)

```javascript
import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, Inject } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

@Catch(HttpException)
export class HelloFilter implements ExceptionFilter {

  @Inject(AppService)
  private service: AppService;

  catch(exception: HttpException, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();

    const statusCode = exception.getStatus();

    const res = exception.getResponse() as { message: string[] };
    
    response.status(statusCode).json({
       code: statusCode,
       message: res?.message?.join ? res?.message?.join(',') : exception.message,
       error: 'Bad Request',
       xxx: 111,
       yyy: this.service.getHello()
    })
  }
}
```
可以看到，service 方法调用成功了：

![](./image/第21章—如何自定义ExceptionFilter-42.image#?w=888&h=872&s=91087&e=png&b=fcfcfc.png)

此外，如果你想自定义 Exception 也是可以的。

比如添加一个 src/unlogin.filter.ts 

```javascript
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

export class UnLoginException{
  message: string;

  constructor(message?){
    this.message = message;
  }
}

@Catch(UnLoginException)
export class UnloginFilter implements ExceptionFilter {
  catch(exception: UnLoginException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    response.status(HttpStatus.UNAUTHORIZED).json({
      code: HttpStatus.UNAUTHORIZED,
      message: 'fail',
      data: exception.message || '用户未登录'
    }).end();
  }
}
```
我们创建了一个 UnloginException 的异常。

然后在 ExceptionFilter 里 @Catch 了它。

在 AppModule 里注册这个全局 Filter：

![](./image/第21章—如何自定义ExceptionFilter-43.image#?w=866&h=892&s=153175&e=png&b=1f1f1f.png)

```javascript
{
  provide: APP_FILTER,
  useClass: UnloginFilter
}
```
之后在 AppController 里抛出这个异常：

![](./image/第21章—如何自定义ExceptionFilter-44.image#?w=634&h=268&s=48195&e=png&b=202020.png)

浏览器里访问下：

![](./image/第21章—如何自定义ExceptionFilter-45.image#?w=592&h=298&s=29084&e=png&b=fdfdfd.png)

可以看到，返回的是我们自定义的格式。

也就是说，可以用自定义 Exception Filter 捕获内置的或者自定义的 Exception。

案例代码在[小册仓库](https://github.com/QuarkGluonPlasma/nestjs-course-code/tree/main/exception-filter-test)。
## 总结

这节我们学习了自定义 Exception Filter。

通过 @Catch 指定要捕获的异常，然后在 catch 方法里拿到异常信息，返回对应的响应。

如果捕获的是 HttpException，要注意兼容下 ValidationPipe 的错误格式的处理。

filter 可以通过 @UseFilters 加在 handler 或者 controller 上，也可以在 main.ts 用 app.useGlobalFilters 全局启用。

如果 filter 要注入其他 provider，就要通过 AppModule 里注册一个 token 为 APP_FILTER 的 provider 的方式。

此外，捕获的 Exception 也是可以自定义的。

这样，我们就可以自定义异常和异常返回的响应格式了。