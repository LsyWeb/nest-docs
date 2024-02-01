Nest 项目会有很多模块，模块之间相互依赖，模块内有 controller、service 等。

当项目复杂之后，模块之间的关系错综复杂。

这时候我们可以用 compodoc 生成一份文档，把依赖关系可视化。

compodoc 本来是给 angular 项目生成项目文档的，但是因为 angular 和 nest 项目结构类似，所以也支持了 nest。

我们创建个项目：

```
nest new compodoc-test
```

![](./image/第72章—使用compodoc生成文档-1.image#?w=1004&h=696&s=162264&e=png&b=010101.png)

安装 compodoc：

```
npm install --save-dev @compodoc/compodoc
```
然后生成一份文档：

```
npx @compodoc/compodoc -p tsconfig.json -s -o
```

![](./image/第72章—使用compodoc生成文档-2.image#?w=1246&h=670&s=56502&e=png&b=181818.png)

这个 README 就是项目下的 README.md:

![](./image/第72章—使用compodoc生成文档-3.image#?w=2136&h=1438&s=299871&e=png&b=fdfdfd.png)

改一下 READMD.md，然后重新执行命令生成：

![](./image/第72章—使用compodoc生成文档-4.image#?w=1328&h=944&s=158651&e=png&b=1c1c1c.png)

可以看到页面上的也变了：

![](./image/第72章—使用compodoc生成文档-5.image#?w=1490&h=1040&s=115146&e=png&b=fdfdfd.png)

overview 部分上面是依赖图，下面是项目有几个模块、controller，可注入的 provider

![](./image/第72章—使用compodoc生成文档-6.image#?w=2532&h=1336&s=207004&e=png&b=fdfdfd.png)

我们在项目下加几个模块：

```
nest g resource aaa

nest g resource bbb
```

![](./image/第72章—使用compodoc生成文档-7.image#?w=776&h=412&s=100199&e=png&b=191919.png)


![](./image/第72章—使用compodoc生成文档-8.image#?w=780&h=360&s=88181&e=png&b=191919.png)

在 AaaModule 里把 AaaService 导出：

![](./image/第72章—使用compodoc生成文档-9.image#?w=854&h=472&s=85655&e=png&b=1f1f1f.png)

然后 BbbModule 引入 AaaModule：

![](./image/第72章—使用compodoc生成文档-10.image#?w=858&h=560&s=98790&e=png&b=1f1f1f.png)

在 BbbService 里注入 AaaService：
 
![](./image/第72章—使用compodoc生成文档-11.image#?w=1204&h=726&s=160144&e=png&b=1f1f1f.png)

先跑起来看一下：

```
npm run start:dev
```

![](./image/第72章—使用compodoc生成文档-12.image#?w=1534&h=614&s=275578&e=png&b=181818.png)

没啥问题：

![](./image/第72章—使用compodoc生成文档-13.image#?w=812&h=248&s=24966&e=png&b=ffffff.png)

类似这种依赖关系，compodoc 可视化之后是什么样的呢？

重新跑一下 compodoc：
```
npx @compodoc/compodoc -p tsconfig.json -s -o
```
依赖可视化是这样的：

![](./image/第72章—使用compodoc生成文档-14.image#?w=1548&h=1284&s=140377&e=png&b=ffffff.png)

用不同的颜色表示 Module、Provider、Exports 等。

可以看到 AppModule 引入了 AaaModule、BbbModule。

AaaModule 导出了 AaaService。

以及每个模块的 provider。

都可以可视化的看到。

点击左侧的 Modules，可以看到每个模块的可视化分析：

AaaModule：

![](./image/第72章—使用compodoc生成文档-15.image#?w=2334&h=1004&s=171232&e=png&b=fdfdfd.png)

BbbModule：
![](./image/第72章—使用compodoc生成文档-16.image#?w=2160&h=1098&s=162601&e=png&b=fdfdfd.png)

AppModule：

![](./image/第72章—使用compodoc生成文档-17.image#?w=2378&h=1086&s=181131&e=png&b=fdfdfd.png)

当然，我们这个例子还是比较简单，当项目依赖复杂之后，这个可视化还是比较有用的。

此外，可以看到每个 Controller、Service 或者其他的 class 的属性、方法，点进去可以看到方法的参数、返回值等：


![](./image/第72章—使用compodoc生成文档-18.image#?w=2206&h=1260&s=173584&e=png&b=fdfdfd.png)

![](./image/第72章—使用compodoc生成文档-19.image#?w=1800&h=1322&s=195763&e=png&b=fdfdfd.png)

当新人接手这个项目的时候，可以通过这份文档快速了解项目的结构。

回过头来，我们看下 compodoc 的一些 cli 选项：

```
npx @compodoc/compodoc -p tsconfig.json -s -o
```

-p 是指定 tsconfig 文件

-s 是启动静态服务器

-o 是打开浏览器

更多选项在 [compodoc 文档](https://compodoc.app/guides/options.html)里可以看到:


![image.png](./image/第72章—使用compodoc生成文档-20.image#?w=2138&h=1432&s=344861&e=png&b=fdfdfd.png)

比如 --theme 可以指定主题，一共有 gitbook,aravel, original, material, postmark, readthedocs, stripe, vagrant 这 8 个主题：

跑一下：
```
npx @compodoc/compodoc -p tsconfig.json -s -o --theme postmark
```

可以看到文档主题换了：

![](./image/第72章—使用compodoc生成文档-21.image#?w=2266&h=1250&s=211864&e=png&b=fdfdfd.png)

选项还是挺多的，如果都写在命令行也不现实，compodoc 同样支持配置文件。

我们在项目下添加一个 .compodoc.json 的文件：

```json
{
    "port": 8888,
    "theme": "postmark"
}
```

然后再跑下 compodoc：

```
npx @compodoc/compodoc -p tsconfig.json -s -o -c .compodoc.json
```

可以看到，配置生效了：

![](./image/第72章—使用compodoc生成文档-22.image#?w=1558&h=1170&s=120468&e=png&b=fcfcfc.png)

文档里写的这些 cli options，基本都可以写在配置文件里。

![](./image/第72章—使用compodoc生成文档-23.image#?w=1998&h=1426&s=347859&e=png&b=fcfcfc.png)

不过一般也不咋用配置。

案例代码上传了[小册仓库](https://github.com/QuarkGluonPlasma/nestjs-course-code/tree/main/compodoc-test)。

## 总结

我们学习了用 compodoc 生成 nest 项目的文档，它会列出项目的模块，可视化展示模块之间的依赖关系，展示每个模块下的 provider、exports 等。

对于新人接手项目来说，还是比较有用的。

而且可视化分析依赖和模块结构，对于复杂项目来说，是比较有帮助的。

compodoc 算是一个不错的 nest 相关的工具。
