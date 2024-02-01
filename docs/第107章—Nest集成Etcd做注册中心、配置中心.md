我们学了 etcd 来做配置中心和注册中心，它比较简单，就是 key 的 put、get、del、watch 这些。

虽然简单，它却是微服务体系必不可少的组件：
 
![](./image/第107章—Nest集成Etcd做注册中心、配置中心-1.image#?w=1166&h=696&s=248707&e=png&b=fffeff.png)

服务注册、发现、配置集中管理，都是用它来做。

那 Nest 里怎么集成它呢？

其实和 Redis 差不多。

集成 Redis 的时候我们就是写了一个 provider 创建连接，然后注入到 service 里调用它的方法。

还可以像 TypeOrmModule、JwtModule 等这些，封装一个动态模块：

![](./image/第107章—Nest集成Etcd做注册中心、配置中心-2.image#?w=836&h=768&s=140728&e=png&b=1f1f1f.png)

下面我们就来写一下：

```
nest new nest-etcd
```

![](./image/第107章—Nest集成Etcd做注册中心、配置中心-3.image#?w=868&h=694&s=152075&e=png&b=010101.png)

进入项目，把服务跑起来：

```
npm run start:dev
```
![](./image/第107章—Nest集成Etcd做注册中心、配置中心-4.image#?w=1602&h=388&s=119095&e=png&b=181818.png)

浏览器访问下：

![](./image/第107章—Nest集成Etcd做注册中心、配置中心-5.image#?w=622&h=222&s=17274&e=png&b=ffffff.png)

nest 服务跑起来了。

按照上节的步骤把 etcd 服务跑起来：

![](./image/第107章—Nest集成Etcd做注册中心、配置中心-6.image#?w=2050&h=1216&s=386967&e=png&b=ffffff.png)

然后我们加一个 etcd 的 provider：

![](./image/第107章—Nest集成Etcd做注册中心、配置中心-7.image#?w=950&h=944&s=138700&e=png&b=1f1f1f.png)

```javascript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Etcd3 } from 'etcd3';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'ETCD_CLIENT',
      useFactory() {
        const client = new Etcd3({
            hosts: 'http://localhost:2379',
            auth: {
                username: 'root',
                password: 'guang'
            }
        });
        return client;
      }
    }
  ],
})
export class AppModule {}

```
在 AppController 里注入下：

![](./image/第107章—Nest集成Etcd做注册中心、配置中心-8.image#?w=1116&h=1088&s=196153&e=png&b=1f1f1f.png)

```javascript
import { Controller, Get, Inject, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { Etcd3 } from 'etcd3';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Inject('ETCD_CLIENT')
  private etcdClient: Etcd3;

  @Get('put')
  async put(@Query('value') value: string) {
    await this.etcdClient.put('aaa').value(value);
    return 'done';
  }

  @Get('get')
  async get() {
    return await this.etcdClient.get('aaa').string();
  }

  @Get('del')
  async del() {
    await this.etcdClient.delete().key('aaa');
    return 'done';
  }
}
```

测试下：

![](./image/第107章—Nest集成Etcd做注册中心、配置中心-9.image#?w=754&h=190&s=19755&e=png&b=ffffff.png)

![](./image/第107章—Nest集成Etcd做注册中心、配置中心-10.image#?w=688&h=190&s=17445&e=png&b=ffffff.png)

![](./image/第107章—Nest集成Etcd做注册中心、配置中心-11.image#?w=630&h=180&s=16336&e=png&b=ffffff.png)

![](./image/第107章—Nest集成Etcd做注册中心、配置中心-12.image#?w=614&h=174&s=15476&e=png&b=ffffff.png)

这样 etcd 就集成好了，很简单。

然后我们封装一个动态模块。

创建一个 module 和 service：

```
nest g module etcd
nest g service etcd
```

![](./image/第107章—Nest集成Etcd做注册中心、配置中心-13.image#?w=800&h=310&s=74417&e=png&b=191919.png)

在 EtcdModule 添加 etcd 的 provider：

```javascript
import { Module } from '@nestjs/common';
import { EtcdService } from './etcd.service';
import { Etcd3 } from 'etcd3';

@Module({
  providers: [
    EtcdService,
    {
      provide: 'ETCD_CLIENT',
      useFactory() {
        const client = new Etcd3({
            hosts: 'http://localhost:2379',
            auth: {
                username: 'root',
                password: 'guang'
            }
        });
        return client;
      }
    }
  ],
  exports: [
    EtcdService
  ]
})
export class EtcdModule {}
```
然后在 EtcdService 添加一些方法：

```javascript
import { Inject, Injectable } from '@nestjs/common';
import { Etcd3 } from 'etcd3';

@Injectable()
export class EtcdService {

    @Inject('ETCD_CLIENT')
    private client: Etcd3;

    // 保存配置
    async saveConfig(key, value) {
        await this.client.put(key).value(value);
    }

    // 读取配置
    async getConfig(key) {
        return await this.client.get(key).string();
    }

    // 删除配置
    async deleteConfig(key) {
        await this.client.delete().key(key);
    }
   
    // 服务注册
    async registerService(serviceName, instanceId, metadata) {
        const key = `/services/${serviceName}/${instanceId}`;
        const lease = this.client.lease(10);
        await lease.put(key).value(JSON.stringify(metadata));
        lease.on('lost', async () => {
            console.log('租约过期，重新注册...');
            await this.registerService(serviceName, instanceId, metadata);
        });
    }

    // 服务发现
    async discoverService(serviceName) {
        const instances = await this.client.getAll().prefix(`/services/${serviceName}`).strings();
        return Object.entries(instances).map(([key, value]) => JSON.parse(value));
    }

    // 监听服务变更
    async watchService(serviceName, callback) {
        const watcher = await this.client.watch().prefix(`/services/${serviceName}`).create();
        watcher.on('put', async event => {
            console.log('新的服务节点添加:', event.key.toString());
            callback(await this.discoverService(serviceName));
        }).on('delete', async event => {
            console.log('服务节点删除:', event.key.toString());
            callback(await this.discoverService(serviceName));
        });
    }

}
```
配置的管理、服务注册、服务发现、服务变更的监听，这些我们都写过一遍，就不细讲了。

然后再创建个模块，引入它试一下：
```
nest g resource aaa
```

![](./image/第107章—Nest集成Etcd做注册中心、配置中心-14.image#?w=794&h=410&s=100568&e=png&b=191919.png)

引入 EtcdModule：

![](./image/第107章—Nest集成Etcd做注册中心、配置中心-15.image#?w=850&h=548&s=100368&e=png&b=1f1f1f.png)

然后在 AaaController 注入 EtcdService，添加两个 handler：

![](./image/第107章—Nest集成Etcd做注册中心、配置中心-16.image#?w=1046&h=798&s=177018&e=png&b=1f1f1f.png)

```javascript
@Inject(EtcdService)
private etcdService: EtcdService;

@Get('save')
async saveConfig(@Query('value') value: string) {
    await this.etcdService.saveConfig('aaa', value);
    return 'done';
}

@Get('get')
async getConfig() {
    return await this.etcdService.getConfig('aaa');
}
```
测试下：

![](./image/第107章—Nest集成Etcd做注册中心、配置中心-17.image#?w=848&h=202&s=20615&e=png&b=ffffff.png)

![](./image/第107章—Nest集成Etcd做注册中心、配置中心-18.image#?w=670&h=184&s=16756&e=png&b=ffffff.png)

没啥问题。

不过现在 EtcdModule 是普通的模块，我们改成动态模块：

```javascript
import { DynamicModule, Module, ModuleMetadata, Type } from '@nestjs/common';
import { EtcdService } from './etcd.service';
import { Etcd3, IOptions } from 'etcd3';

export const ETCD_CLIENT_TOKEN = 'ETCD_CLIENT';

export const ETCD_CLIENT_OPTIONS_TOKEN = 'ETCD_CLIENT_OPTIONS';

@Module({})
export class EtcdModule {

  static forRoot(options?: IOptions): DynamicModule {
    return {
      module: EtcdModule,
      providers: [
        EtcdService,
        {
          provide: ETCD_CLIENT_TOKEN,
          useFactory(options: IOptions) {
            const client = new Etcd3(options);
            return client;
          },
          inject: [ETCD_CLIENT_OPTIONS_TOKEN]
        },
        {
          provide: ETCD_CLIENT_OPTIONS_TOKEN,
          useValue: options
        }
      ],
      exports: [
        EtcdService
      ]
    };
  }
}
```
把 EtcdModule 改成动态模块的方式，加一个 forRoot 方法。

把传入的 options 作为一个 provider，然后再创建 etcd client 作为一个 provider。

然后 AaaModule 引入 EtcdModule 的方式也改下：

![](./image/第107章—Nest集成Etcd做注册中心、配置中心-19.image#?w=904&h=766&s=131351&e=png&b=1f1f1f.png)

用起来是一样的：

![](./image/第107章—Nest集成Etcd做注册中心、配置中心-20.image#?w=706&h=192&s=16946&e=png&b=ffffff.png)

但是现在 etcd 的参数是动态传入的了，这就是动态模块的好处。

当然，一般动态模块都有 forRootAsync，我们也加一下：


![](./image/第107章—Nest集成Etcd做注册中心、配置中心-21.image#?w=1210&h=638&s=126562&e=png&b=1f1f1f.png)

![](./image/第107章—Nest集成Etcd做注册中心、配置中心-22.image#?w=1308&h=1128&s=169282&e=png&b=1f1f1f.png)

```javascript
export interface EtcdModuleAsyncOptions  {
  useFactory?: (...args: any[]) => Promise<IOptions> | IOptions;
  inject?: any[];
}
```
```javascript
static forRootAsync(options: EtcdModuleAsyncOptions): DynamicModule {
    return {
      module: EtcdModule,
      providers: [
        EtcdService,
        {
          provide: ETCD_CLIENT_TOKEN,
          useFactory(options: IOptions) {
            const client = new Etcd3(options);
            return client;
          },
          inject: [ETCD_CLIENT_OPTIONS_TOKEN]
        },
        {
          provide: ETCD_CLIENT_OPTIONS_TOKEN,
          useFactory: options.useFactory,
          inject: options.inject || []
        }
      ],
      exports: [
        EtcdService
      ]
    };
}
```
和 forRoot 的区别就是现在的 options 的 provider 是通过 useFactory 的方式创建的，之前是直接传入。

现在就可以这样传入 options 了：

![](./image/第107章—Nest集成Etcd做注册中心、配置中心-23.image#?w=1018&h=1052&s=148689&e=png&b=1f1f1f.png)

```javascript
EtcdModule.forRootAsync({
  async useFactory() {
      await 111;
      return {
          hosts: 'http://localhost:2379',
          auth: {
              username: 'root',
              password: 'guang'
          }
      }
  }
})
```

我们安装下 config 的包

```
npm install @nestjs/config
```
在 AppModule 引入 ConfigModule：

![](./image/第107章—Nest集成Etcd做注册中心、配置中心-24.image#?w=802&h=682&s=127643&e=png&b=1f1f1f.png)

```javascript
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: 'src/.env'
})
```
添加对应的 src/.env

```env
etcd_hosts=http://localhost:2379
etcd_auth_username=root
etcd_auth_password=guang
```
然后在引入 EtcdModule 的时候，从 ConfigService 拿配置：

![](./image/第107章—Nest集成Etcd做注册中心、配置中心-25.image#?w=1220&h=790&s=141984&e=png&b=1f1f1f.png)

```javascript
EtcdModule.forRootAsync({
  async useFactory(configService: ConfigService) {
      await 111;
      return {
          hosts: configService.get('etcd_hosts'),
          auth: {
              username: configService.get('etcd_auth_username'),
              password: configService.get('etcd_auth_password')
          }
      }
  },
  inject: [ConfigService]
})
```
测试下：

![](./image/第107章—Nest集成Etcd做注册中心、配置中心-26.image#?w=636&h=216&s=17078&e=png&b=ffffff.png)

功能正常。

这样，EtcdModule.forRootAsync 就成功实现了。

案例代码上传了[小册仓库](https://github.com/QuarkGluonPlasma/nestjs-course-code/tree/main/nest-etcd)。
## 总结

这节我们做了 Nest 和 etcd 的集成。

或者加一个 provider 创建连接，然后直接注入 etcdClient 来 put、get、del、watch。

或者再做一步，封装一个动态模块来用，用的时候再传入连接配置 

和集成 Redis 的时候差不多。

注册中心和配置中心是微服务体系必不可少的组件，后面会大量用到。
