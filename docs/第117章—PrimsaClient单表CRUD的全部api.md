我们学了 Prisma 的命令、schema 的语法，这节来过一遍 Prisma Client 的 api。

这节只涉及单个表的 CRUD 的 api。

创建个新项目：

```
mkdir prisma-client-api
cd prisma-client-api
npm init -y
```
![](./image/第117章—PrimsaClient单表CRUD的全部api-1.image#?w=870&h=700&s=88483&e=png&b=000000.png)

进入项目，执行 init 命令：

```
npx prisma init
```

![](./image/第117章—PrimsaClient单表CRUD的全部api-2.image#?w=1010&h=624&s=105602&e=png&b=191919.png)

生成了 .env 和 schema 文件：

![](./image/第117章—PrimsaClient单表CRUD的全部api-3.image#?w=484&h=276&s=27131&e=png&b=181818.png)

然后改下 .env 文件的数据库连接信息：

![](./image/第117章—PrimsaClient单表CRUD的全部api-4.image#?w=1026&h=348&s=134798&e=png&b=202020.png)

```
DATABASE_URL="mysql://root:guang@localhost:3306/prisma_test"
```

改一下 datasource 的 provider 为 mysql，并且添加一个 model

![](./image/第117章—PrimsaClient单表CRUD的全部api-5.image#?w=820&h=554&s=75992&e=png&b=1f1f1f.png)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Aaa {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}
```

然后再添加一个 generator，生成 docs，并且修改下生成代码的位置：

![](./image/第117章—PrimsaClient单表CRUD的全部api-6.image#?w=926&h=744&s=108104&e=png&b=1f1f1f.png)

```
generator docs {
  provider = "node node_modules/prisma-docs-generator"
  output   = "../generated/docs"
}
```

安装用到的 generator 包：
```
npm install --save-dev prisma-docs-generator
```
之后执行 migrate reset 重置下：

```
npx prisma migrate reset
```

![](./image/第117章—PrimsaClient单表CRUD的全部api-7.image#?w=1072&h=622&s=88219&e=png&b=191919.png)

之后用 migrate dev 创建新的迁移：

```
npx prisma migrate dev --name aaa
```

![](./image/第117章—PrimsaClient单表CRUD的全部api-8.image#?w=996&h=524&s=82026&e=png&b=191919.png)

可以看到，生成了 client 代码、docs 文档，还有 sql 文件。

数据库中也多了这个表：

![](./image/第117章—PrimsaClient单表CRUD的全部api-9.image#?w=1082&h=576&s=178048&e=png&b=eeebea.png)

然后我们写下初始化数据的代码：

首先安装 ts、ts-node 包：

```
npm install typescript ts-node @types/node --save-dev
```
创建 tsconfig.json

```
npx tsc --init
```
把注释删掉，保留这些配置就行：

```json
{
  "compilerOptions": {
    "target": "es2016",
    "module": "commonjs",
    "types": ["node"],
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
}

```
在 package.json 配置下 seed 命令：

```json
"prisma": {
    "seed": "npx ts-node prisma/seed.ts"
},
```
然后写下 prisma/seed.ts

```javascript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: [
    {
      emit: 'stdout',
      level: 'query'
    },
  ],
});

async function main() {
    await prisma.aaa.createMany({
        data: [
            {
                name: 'aaa',
                email: 'aaa@xx.com'
            },
            {
                name: 'bbb',
                email: 'bbb@xx.com'
            },
            {
                name: 'ccc',
                email: 'ccc@xx.com'
            },
            {
                name: 'ddd',
                email: 'ddd@xx.com'
            },
            {
                name: 'eee',
                email: 'eee@xx.com'
            },
        ]
    });
    console.log('done');
}

main();
```
很容易看懂，就是插入了 5 条记录。

执行 seed：

```
npx prisma db seed
```
![](./image/第117章—PrimsaClient单表CRUD的全部api-10.image#?w=1356&h=276&s=58495&e=png&b=181818.png)

打印了插入数据的 sql。

去 mysql workbench 里看下：

![](./image/第117章—PrimsaClient单表CRUD的全部api-11.image#?w=970&h=510&s=160843&e=png&b=eeeae8.png)

插入成功了。

然后来写下 client 的 crud 代码。

创建 src/index.ts

```javascript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: [
    {
      emit: 'stdout',
      level: 'query'
    },
  ],
});

async function main() {
    
}

main();
```

client 都有哪些方法呢？

我们不是还用 docs generator 生成了文档么？看下那个就知道了。

```
npx http-server ./generated/docs
```
跑一个静态服务：

![](./image/第117章—PrimsaClient单表CRUD的全部api-12.image#?w=760&h=494&s=84095&e=png&b=181818.png)

访问 http://localhost:8080 可以看到 Aaa 的字段和方法，一共 9 个方法：

![](./image/第117章—PrimsaClient单表CRUD的全部api-13.image#?w=1518&h=1112&s=169522&e=png&b=ffffff.png)

我们依次试一下：

## findUnique

findUnique 是用来查找唯一的记录的，可以根据主键或者有唯一索引的列来查：

```javascript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: [
    {
      emit: 'stdout',
      level: 'query'
    },
  ],
});

async function test1() {
    const aaa = await prisma.aaa.findUnique({
        where: {
            id: 1
        }
    });
    console.log(aaa);

    const bbb = await prisma.aaa.findUnique({
        where: {
            email: 'bbb@xx.com'
        }
    });
    console.log(bbb);
}

test1();
```
所以，这里的 id、email 都可以：

![](./image/第117章—PrimsaClient单表CRUD的全部api-14.image#?w=726&h=220&s=31608&e=png&b=1f1f1f.png)

跑一下试试：

```
npx ts-node ./src/index.ts
```

![](./image/第117章—PrimsaClient单表CRUD的全部api-15.image#?w=1128&h=222&s=62804&e=png&b=191919.png)

但是如果指定 name 就不行了：

![](./image/第117章—PrimsaClient单表CRUD的全部api-16.image#?w=562&h=242&s=27950&e=png&b=202020.png)

因为通过 name 来查并不能保证记录唯一。

你还可以通过 select 指定返回的列：

```javascript
async function test1() {
    const aaa = await prisma.aaa.findUnique({
        where: {
            id: 1
        }
    });
    console.log(aaa);

    const bbb = await prisma.aaa.findUnique({
        where: {
            email: 'bbb@xx.com'
        },
        select: {
            id: true,
            email: true
        }
    });
    console.log(bbb);
}
```

比如我通过 select 指定返回 id、email：

![](./image/第117章—PrimsaClient单表CRUD的全部api-17.image#?w=880&h=218&s=56218&e=png&b=191919.png)

那结果里就只包含这两个字段。

## findUniqueOrThrow

findUniqueOrThrow 和 findUnique 的区别是它如果没找到对应的记录会抛异常，而 findUnique 会返回 null。

先试下 findUnique：

```javascript

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: [
    {
      emit: 'stdout',
      level: 'query'
    },
  ],
});


async function test2() {
    const aaa = await prisma.aaa.findUnique({
        where: {
            id: 10
        }
    });
    console.log(aaa);
}

test2();
```

![](./image/第117章—PrimsaClient单表CRUD的全部api-18.image#?w=1190&h=686&s=105718&e=png&b=1d1d1d.png)

再换成 findUniqueOrThrow 试试：

```javascript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: [
    {
      emit: 'stdout',
      level: 'query'
    },
  ],
});

async function test2() {
    const aaa = await prisma.aaa.findUniqueOrThrow({
        where: {
            id: 10
        }
    });
    console.log(aaa);
}

test2();
```

如果没找到会抛异常：

![](./image/第117章—PrimsaClient单表CRUD的全部api-19.image#?w=1038&h=748&s=128181&e=png&b=1d1d1d.png)

## findMany

findMany 很明显是查找多条记录的。

比如查找 email 包含 xx 的记录，按照 name 降序排列：

```javascript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: [
    {
      emit: 'stdout',
      level: 'query'
    },
  ],
});

async function test3() {
    const res = await prisma.aaa.findMany({
        where: {
            email: {
                contains: 'xx'
            }
        },
        orderBy: {
            name: 'desc'
        }
    });
    console.log(res);
}

test3();

```

跑一下：
```
npx ts-node ./src/index.ts
```
![](./image/第117章—PrimsaClient单表CRUD的全部api-20.image#?w=880&h=310&s=60018&e=png&b=181818.png)

然后再加个分页，取从第 2 条开始的 3 条。

```javascript
async function test3() {
    const res = await prisma.aaa.findMany({
        where: {
            email: {
                contains: 'xx'
            }
        },
        orderBy: {
            name: 'desc'
        },
        skip: 2,
        take: 3
    });
    console.log(res);
}
```
下标是从 0 开始的，所以是这三条：

![](./image/第117章—PrimsaClient单表CRUD的全部api-21.image#?w=824&h=272&s=49555&e=png&b=181818.png)

当然，你可以再加上 select 指定返回的字段：

```javascript
async function test3() {
    const res = await prisma.aaa.findMany({
        where: {
            email: {
                contains: 'xx'
            }
        },
        select: {
            id: true,
            email: true,
        },
        orderBy: {
            name: 'desc'
        },
        skip: 2,
        take: 3
    });
    console.log(res);
}
```

![](./image/第117章—PrimsaClient单表CRUD的全部api-22.image#?w=996&h=246&s=47141&e=png&b=181818.png)

你会发现熟练 sql 之后，这些 api 用起来都很自然，过一遍就会了。

## findFirst

findFirst 和 findMany 的唯一区别是，这个返回第一条记录。

```javascript
async  function test4() {
    const res = await prisma.aaa.findFirst({
        where: {
            email: {
                contains: 'xx'
            }
        },
        select: {
            id: true,
            email: true,
        },
        orderBy: {
            name: 'desc'
        },
        skip: 2,
        take: 3
    });
    console.log(res);
}
test4();
```

![](./image/第117章—PrimsaClient单表CRUD的全部api-23.image#?w=714&h=146&s=34628&e=png&b=191919.png)

此外，where 条件这里可以指定的更细致：

![](./image/第117章—PrimsaClient单表CRUD的全部api-24.image#?w=726&h=650&s=59985&e=png&b=1f1f1f.png)

contains 是包含，endsWith 是以什么结尾

gt 是 greater than 大于，lte 是 less than or equal 大于等于

这些过滤条件都很容易理解，就不展开了。

此外，还有 findFirstOrThrow 方法，那个也是如果没找到，抛异常，参数和 FindFirst 一样。

## create

这个我们用过多次了，用来创建记录：

```javascript
async  function test5() {
    const res = await prisma.aaa.create({
        data: {
            name: 'kk',
            email: 'kk@xx.com'
        },
        select: {
            email: true
        }
    });
    console.log(res);
}
test5();
```
它同样也可以通过 select 指定插入之后再查询出来的字段。

![](./image/第117章—PrimsaClient单表CRUD的全部api-25.image#?w=706&h=224&s=53669&e=png&b=191919.png)

createMany 我们用过，这里就不测了：

![](./image/第117章—PrimsaClient单表CRUD的全部api-26.image#?w=688&h=980&s=92858&e=png&b=1f1f1f.png)

## update

update 明显是用来更新的。

它可以指定 where 条件，指定 data，还可以指定 select 出的字段：

```javascript
async function test6() {
    const res = await prisma.aaa.update({
        where: { id: 3 },
        data: { email: '3333@xx.com' },
        select: {
            id: true,
            email: true
        }
    });
    console.log(res);
}

test6();
```
跑一下：
```
npx ts-node ./src/index.ts
```
![](./image/第117章—PrimsaClient单表CRUD的全部api-27.image#?w=792&h=302&s=66957&e=png&b=191919.png)

可以看到，打印了 3 条 sql：

首先根据 where 条件查询出这条记录，然后 update，之后再 select 查询出更新后的记录。

updateMany 自然是更新多条记录。

比如你想更新所有邮箱包含 xx.com 的记录为 666@xx.com

![](./image/第117章—PrimsaClient单表CRUD的全部api-28.image#?w=680&h=490&s=51454&e=png&b=1f1f1f.png)

用 update 会报错，它只是用来更新单条记录的，需要指定 id 或者有唯一索引的列。

这时候改成 udpateMany 就可以了。

```javascript
async function test7() {
    const res = await prisma.aaa.updateMany({
        where: { 
            email: {
                contains: 'xx.com'
            } 
        },
        data: { name: '666' },
    });
    console.log(res);
}

test7();
```

![](./image/第117章—PrimsaClient单表CRUD的全部api-29.image#?w=766&h=182&s=35654&e=png&b=181818.png)

在 mysql workbench 里可以看到，确实改了：

![](./image/第117章—PrimsaClient单表CRUD的全部api-30.image#?w=558&h=362&s=91564&e=png&b=fafafa.png)

## upsert

upsert 是 update 和 insert 的意思。

当传入的 id 有对应记录的时候，会更新，否则，会创建记录。

```javascript
async function test8() {
    const res = await prisma.aaa.upsert({
        where: { id: 11 },
        update: { email: 'yy@xx.com' },
        create: { 
            id:  11,
            name: 'xxx',
            email: 'xxx@xx.com'
        },
    });
    console.log(res);
}

test8();
```
第一次跑执行的是 insert：

![](./image/第117章—PrimsaClient单表CRUD的全部api-31.image#?w=884&h=298&s=67052&e=png&b=191919.png)

![](./image/第117章—PrimsaClient单表CRUD的全部api-32.image#?w=606&h=376&s=101801&e=png&b=f9f9f9.png)

第二次跑就是 update 了：

![](./image/第117章—PrimsaClient单表CRUD的全部api-33.image#?w=832&h=306&s=67081&e=png&b=191919.png)

![](./image/第117章—PrimsaClient单表CRUD的全部api-34.image#?w=542&h=300&s=76891&e=png&b=fcfcfc.png)

## delete

delete 就比较简单了，我们和 deleteMany 一起测试下：

```javascript
async function test9() {
    await prisma.aaa.delete({
        where: { id: 1 },
    });

    await prisma.aaa.deleteMany({
        where: {
            id: {
                in: [11, 2]
            }
        }
    });
}

test9();
```

![](./image/第117章—PrimsaClient单表CRUD的全部api-35.image#?w=1310&h=242&s=72029&e=png&b=191919.png)

可以看到有两条 delete 语句。

![](./image/第117章—PrimsaClient单表CRUD的全部api-36.image#?w=736&h=418&s=103698&e=gif&f=17&b=f8f8f8.png)

可以看到 3 条记录都被删除了。

## count

count 其实和 findMany 参数一样，只不过这里不返回具体记录，而是返回记录的条数。

比如 findMany 是这样的：

```javascript
async function test10() {
    const res = await prisma.aaa.findMany({
        where: {
            email: {
                contains: 'xx'
            }
        },
        orderBy: {
            name: 'desc'
        },
        skip: 2,
        take: 3
    });
    console.log(res);
}
test10();
```

![](./image/第117章—PrimsaClient单表CRUD的全部api-37.image#?w=730&h=254&s=42719&e=png&b=181818.png)

把 findMany 改为 count 就是这样了：

```javascript
async function test10() {
    const res = await prisma.aaa.count({
        where: {
            email: {
                contains: 'xx'
            }
        },
        orderBy: {
            name: 'desc'
        },
        skip: 2,
        take: 3
    });
    console.log(res);
}
test10();
```

![](./image/第117章—PrimsaClient单表CRUD的全部api-38.image#?w=720&h=144&s=27187&e=png&b=181818.png)

## aggregate 

aggregate 是统计相关的。

它除了 where、orderBy、skip、take 这些参数外，还可以指定 _count、_avg、_sum、_min、_max
这些。

不过我们现在的表里没有数字相关的列。

改一下 model：

![](./image/第117章—PrimsaClient单表CRUD的全部api-39.image#?w=814&h=510&s=70599&e=png&b=1f1f1f.png)

```
model Aaa {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  age Int       @default(0)
}
```

然后创建一个新的 migration：

```
npx prisma migrate dev --name bbb
```

![](./image/第117章—PrimsaClient单表CRUD的全部api-40.image#?w=1134&h=524&s=87138&e=png&b=181818.png)

对应的 sql 如下：

![](./image/第117章—PrimsaClient单表CRUD的全部api-41.image#?w=1598&h=372&s=85466&e=png&b=1e1e1e.png)

然后我们用代码改一下：

```javascript
async function test11() {
    await prisma.aaa.update({
        where: {
            id: 3
        },
        data: {
            age: 3
        }
    });

    await prisma.aaa.update({
        where: {
            id: 5
        },
        data: {
            age: 5
        }
    });
}
test11();
```
![](./image/第117章—PrimsaClient单表CRUD的全部api-42.image#?w=1140&h=522&s=124326&e=png&b=191919.png)

在 mysql workbench 里刷新下，可以看到确实改了：

![](./image/第117章—PrimsaClient单表CRUD的全部api-43.image#?w=668&h=302&s=78342&e=png&b=f9f9f9.png)

接下来就可以测试 aggregate 方法了：

```javascript
async function test12() {
    const res = await prisma.aaa.aggregate({
        where: {
            email: {
                contains: 'xx.com'
            }
        },
        _count: {
            _all: true,
        },
        _max: {
            age: true
        },
        _min: {
            age: true
        },
        _avg: {
            age: true
        }
    });
    console.log(res);
}
test12();
```

跑一下：

![](./image/第117章—PrimsaClient单表CRUD的全部api-44.image#?w=872&h=272&s=42847&e=png&b=181818.png)

可以看到返回的最大值、最小值、计数、平均值，都是对的。

## groupBy

最后还有个 groupBy 方法，大家有 sql 基础也很容易搞懂，这个就是分组的。

```javascript
async function test13() {
    const res = await prisma.aaa.groupBy({
        by: ['email'],
        _count: {
          _all: true
        },
        _sum: {
          age: true,
        },
        having: {
          age: {
            _avg: {
              gt: 2,
            }
          },
        },
    })
    console.log(res);
}

test13();

```
就是按照 email 分组，过滤出平均年龄大于 2 的分组，计算年龄总和返回。

结果如下：
![](./image/第117章—PrimsaClient单表CRUD的全部api-45.image#?w=994&h=216&s=48182&e=png&b=181818.png)

因为 age 大于 2 的就 2 条，然后算平均值、计数，就是上面的结果了：

![](./image/第117章—PrimsaClient单表CRUD的全部api-46.image#?w=702&h=254&s=61142&e=png&b=fcfcfc.png)

这样，我们就把所有 Prisma Client 的 api 过了一遍。

案例代码在[小册仓库](https://github.com/QuarkGluonPlasma/nestjs-course-code/tree/main/prisma-client-api)

## 总结

这节我们过了一遍 Prisma Client 的单个表 CRUD 的 api。

分别包括 create、crateMany、update、updateMany、delete、deleteMany、findMany、findFirst、findFirstOrThrow、findUnique、findUniqueOrThrow。

以及 count、aggregate、groupBy 这些统计相关的。

其实有 sql 的基础的话，学习这些 api 很容易，过一遍就会了。
