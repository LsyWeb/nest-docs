上节我们过了一遍 Prisma Client 做 CRUD 的 api，但那只是针对单表的，这节我们把涉及到多表的 CRUD 的 api 过一遍。

创建个新项目：

```
mkdir prisma-client-api2
cd prisma-client-api2
npm init -y
```
![](./image/第118章—PrismaClient多表CRUD的全部api-1.image#?w=890&h=702&s=91178&e=png&b=000000.png)

进入项目，执行 init 命令：

```
npx prisma init
```

![](./image/第118章—PrismaClient多表CRUD的全部api-2.image#?w=1010&h=624&s=105602&e=png&b=191919.png)

生成了 .env 和 schema 文件：

![](./image/第118章—PrismaClient多表CRUD的全部api-3.image#?w=512&h=192&s=18392&e=png&b=1e1e1e.png)

然后改下 .env 文件的数据库连接信息：

![](./image/第118章—PrismaClient多表CRUD的全部api-4.image#?w=1026&h=348&s=134798&e=png&b=202020.png)

```
DATABASE_URL="mysql://root:guang@localhost:3306/prisma_test"
```
改一下 datasource 的 provider 为 mysql，并且添加 model

![](./image/第118章—PrismaClient多表CRUD的全部api-5.image#?w=1358&h=956&s=184756&e=png&b=1f1f1f.png)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Department {
  id        Int    @id @default(autoincrement())
  name      String  @db.VarChar(20)
  createTime DateTime @default(now())
  updateTime DateTime @updatedAt
  employees     Employee[]
}

model Employee {
  id         Int       @id @default(autoincrement())
  name      String     @db.VarChar(20)
  phone     String     @db.VarChar(30)  

  deaprtmentId Int
  department     Department      @relation(fields: [deaprtmentId], references: [id])
}
```

之后执行 migrate reset 重置下：

```
npx prisma migrate reset
```

![](./image/第118章—PrismaClient多表CRUD的全部api-6.image#?w=1072&h=622&s=88219&e=png&b=191919.png)

然后用 migrate dev 创建新的迁移：

```
npx prisma migrate dev --name aaa
```
![](./image/第118章—PrismaClient多表CRUD的全部api-7.image#?w=1188&h=560&s=87234&e=png&b=191919.png)

生成了 client 代码，还有 sql 文件。

![](./image/第118章—PrismaClient多表CRUD的全部api-8.image#?w=2034&h=1060&s=291405&e=png&b=1e1e1e.png)

数据库中也多了这 2 个表：

![](./image/第118章—PrismaClient多表CRUD的全部api-9.image#?w=1070&h=484&s=156945&e=png&b=f0eded.png)

![](./image/第118章—PrismaClient多表CRUD的全部api-10.image#?w=1012&h=406&s=114606&e=png&b=f0eded.png)

然后来写下 client 的 crud 代码。

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

然后分别做下 CRUD。

首先是插入数据：

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
   await prisma.department.create({
        data: {
            name: '技术部',
            employees: {
                create: [
                    {
                        name: '小张',
                        phone: '13333333333'
                    },
                    {
                        name: '小李',
                        phone: '13222222222'
                    }
                ]
            }
        }
   })
}

test1();
```
插入关联 model 的数据的时候，也是用 create 指定：

![](./image/第118章—PrismaClient多表CRUD的全部api-11.image#?w=922&h=880&s=93789&e=png&b=1f1f1f.png)

测试下：

```
npx ts-node ./src/index.ts
```

![](./image/第118章—PrismaClient多表CRUD的全部api-12.image#?w=1374&h=242&s=81019&e=png&b=191919.png)

在 mysql workbench 里看下结果：

![](./image/第118章—PrismaClient多表CRUD的全部api-13.image#?w=1306&h=452&s=146375&e=png&b=f0eded.png)

![](./image/第118章—PrismaClient多表CRUD的全部api-14.image#?w=1074&h=454&s=144846&e=png&b=efeceb.png)

确实，数据都被正确插入了。

当然，你也可以用这种写法：

![](./image/第118章—PrismaClient多表CRUD的全部api-15.image#?w=904&h=868&s=93803&e=png&b=1f1f1f.png)

```javascript
async function test2() {
    await prisma.department.create({
         data: {
             name: '技术部',
             employees: {
                 createMany: {
                    data: [
                        {
                            name: '小王',
                            phone: '13333333333'
                        },
                        {
                            name: '小周',
                            phone: '13222222222'
                        }
                    ],

                 }
             }
         }
    })
 }

 test2();
```
跑一下：

![](./image/第118章—PrismaClient多表CRUD的全部api-16.image#?w=912&h=210&s=55131&e=png&b=191919.png)

效果一样：

![](./image/第118章—PrismaClient多表CRUD的全部api-17.image#?w=796&h=204&s=75130&e=png&b=fbfbfb.png)

![](./image/第118章—PrismaClient多表CRUD的全部api-18.image#?w=580&h=306&s=71258&e=png&b=f8f8f8.png)

那如何关联查询呢？

可以这样写：

```javascript
async function test3() {
    const res1 = await prisma.department.findUnique({
        where: {
            id: 1
        },
        include: {
            employees: true
        }
    });
    console.log(res1);

    const res2 = await prisma.department.findUnique({
        where: {
            id: 1
        },
        include: {
            employees: {
                where: {
                    name: '小张'
                },
                select: {
                    name: true
                }
            }
        }
    });
    console.log(res2);

    const res3 = await prisma.department.findUnique({
        where: {
            id: 1
        }
    }).employees();
    console.log(res3);
}

test3();
```
查询 department 的时候，通过 include 指定关联查询出 employees。

include 还可以指定 where 等查询的参数，进一步过滤。

此外，你也可以在查出 department 后调用 empolyees() 方法来查询。

可以看到，都能正确查出关联数据：

![](./image/第118章—PrismaClient多表CRUD的全部api-19.image#?w=1164&h=934&s=202146&e=png&b=191919.png)

再就是关联更新：

```javascript
async function test4() {
    const res1 = await prisma.department.update({
        where: {
            id: 1
        },
        data: {
            name: '销售部',
            employees: {
                create: [
                    {
                        name: '小刘',
                        phone: '13266666666'
                    }
                ]
            }
        }
    });
    console.log(res1);
}

test4();
```
比如我在更新 department 的时候关联插入了一条 employee 的记录。

跑一下：

![](./image/第118章—PrismaClient多表CRUD的全部api-20.image#?w=1078&h=442&s=97332&e=png&b=181818.png)

在 mysql workbench 里可以看到，id 为 1 的 department 更新了：

![](./image/第118章—PrismaClient多表CRUD的全部api-21.image#?w=824&h=224&s=69443&e=png&b=f7f7f7.png)

关联插入了一条 employee 的记录：

![](./image/第118章—PrismaClient多表CRUD的全部api-22.image#?w=566&h=334&s=79102&e=png&b=f7f7f7.png)

![](./image/第118章—PrismaClient多表CRUD的全部api-23.image#?w=582&h=312&s=86589&e=png&b=f9f9f9.png)

更新 department 的时候，除了可以插入 empolyee 的数据，也可以和别的 empolyee 建立关联。

比如 id 为 4 的 empolyee：

![](./image/第118章—PrismaClient多表CRUD的全部api-24.image#?w=566&h=348&s=87349&e=png&b=f9f9f9.png)

现在他关联的是 id 为 2 的 department。

我们 update 的时候使用 connect 和它关联：

```javascript
async function test5() {
    const res1 = await prisma.department.update({
        where: {
            id: 1
        },
        data: {
            name: '销售部',
            employees: {
                connect: [
                    {
                        id: 4
                    }
                ]
            }
        }
    });
    console.log(res1);
}
test5();
```
![](./image/第118章—PrismaClient多表CRUD的全部api-25.image#?w=848&h=770&s=89854&e=png&b=1f1f1f.png)

跑一下：

![](./image/第118章—PrismaClient多表CRUD的全部api-26.image#?w=828&h=442&s=88252&e=png&b=181818.png)

刷新可以看到，id 为 4 的 employee 关联的 department 就变了：

![](./image/第118章—PrismaClient多表CRUD的全部api-27.image#?w=570&h=314&s=85581&e=png&b=fafafa.png)

如果是某个 id 的数据存在就 connect，不存在就 create 呢？

可以这样写：

```javascript
async function test6() {
    const res1 = await prisma.department.update({
        where: {
            id: 1
        },
        data: {
            name: '销售部',
            employees: {
                connectOrCreate: {
                    where: {
                        id: 6
                    },
                    create: {
                        id: 6,
                        name: '小张',
                        phone: '13256665555'
                    }
                }
            }
        }
    });
    console.log(res1);
}
test6();
```
第一次跑，执行的是 insert：

![](./image/第118章—PrismaClient多表CRUD的全部api-28.image#?w=890&h=484&s=99574&e=png&b=181818.png)

![](./image/第118章—PrismaClient多表CRUD的全部api-29.image#?w=552&h=342&s=95419&e=png&b=fafafa.png)

第二次跑，就是 update 了：

![](./image/第118章—PrismaClient多表CRUD的全部api-30.image#?w=1222&h=496&s=112662&e=png&b=181818.png)

也就是说，update 的时候可以通过 create、connect、connectOrCreate 来插入新的关联 model 的记录或者关联已有的记录。

当然，create 的时候也可以这样：

![](./image/第118章—PrismaClient多表CRUD的全部api-31.image#?w=658&h=386&s=54689&e=png&b=202020.png)

效果一样，就不一个个测试了。

再就是删除：

如果我们想删除 id 为 1 的 department 的所有 empolyee，可以这样写：

```javascript
async function test7() {
    await prisma.employee.deleteMany({
        where: {
            department: {
                id: 1
            }
        },
    });
}
test7();
```
 
![](./image/第118章—PrismaClient多表CRUD的全部api-32.image#?w=892&h=148&s=37877&e=png&b=191919.png)

![](./image/第118章—PrismaClient多表CRUD的全部api-33.image#?w=706&h=378&s=100166&e=gif&f=18&b=f7f7f7.png)

这就是多个 model 关联时的 CRUD。

此外，Prisma 还可以直接执行 sql：

```javascript
async function test8() {
    await prisma.$executeRaw`TRUNCATE TABLE Employee`;

    const res = await prisma.$queryRaw`select * from Department`;
    console.log(res);
}
test8();
```
![](./image/第118章—PrismaClient多表CRUD的全部api-34.image#?w=708&h=502&s=68097&e=png&b=181818.png)

这样，当上面的 api 都不能满足需求的时候，你就可以直接执行 sql。

案例代码在[小册仓库](https://github.com/QuarkGluonPlasma/nestjs-course-code/tree/main/prisma-client-api2)

## 总结

这节我们过了一遍多 model 关联的时候涉及到多个表的 CRUD 方法。

还是 findXxx、updateXxx、deleteXxx、createXxx 那些方法，只不过查询的时候可以通过 include 包含关联记录，新增修改的时候可以通过 create、connect、connectOrCreate 来关联或者插入记录。

此外，你还可以直接执行 sql。

通过这些 api，我们就能完成各种 CRUD 需求了。

