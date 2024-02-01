import{_ as s,c as p,o as n,V as i}from"./chunks/framework.BbAbY5cn.js";const a="/assets/第31章-1.bA7CHUqB.png",e="/assets/第31章-2.ZGVxlTwj.png",t="/assets/第31章-3.tydR-JHX.png",o="/assets/第31章-4.cHD2X7D-.png",l="/assets/第31章-5.Uu-Lblke.png",r="/assets/第31章-6.5Iyto0Up.png",d="/assets/第31章-7.o_0UHrpc.png",c="/assets/第31章-8.hDTBWyP2.png",k="/assets/第31章-9.KzDC8z_e.png",g="/assets/第31章-10.UtUeooQ6.png",h="/assets/第31章-11.V5_4TbhA.png",m="/assets/第31章-12.vs_7Seoa.png",_="/assets/第31章-13.bMOgq8uI.png",u="/assets/第31章-14.2PRE0vGK.png",E="/assets/第31章-15.22VS8CJ7.png",b="/assets/第31章-16.CSjd8Emi.png",y="/assets/第31章-17.IXiqI_OP.png",D="/assets/第31章-18.EKg1ZgIT.png",f="/assets/第31章-19.kxMGQJXM.png",R="/assets/第31章-20.JD1og6Ct.png",O="/assets/第31章-21.wTz7ZSdl.png",F="/assets/第31章-22.sjvTum8t.png",I=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"第31章—Nest项目如何编写Dockerfile.md","filePath":"第31章—Nest项目如何编写Dockerfile.md"}'),C={name:"第31章—Nest项目如何编写Dockerfile.md"},A=i('<p>首先思考一个问题：</p><p>dockerfile 是在哪里 build 的，在命令行工具里，还是在 docker 守护进程呢？</p><p>答案是在守护进程 docker daemon。</p><p>我没启动 docker daemon 的时候是不能 build 的，启动之后才可以：</p><p><img src="'+a+'" alt=""></p><p>命令行工具会和 docker daemon 交互来实现各种功能。</p><p>比如 docker build 的时候，会把 dockerfile 和它的构建上下文（也就是所在目录）打包发送给 docker daemon 来构建镜像。</p><p><img src="'+e+`" alt=""></p><p>比如我们会执行这样的命令：</p><pre><code>docker build -t name:tag -f filename .
</code></pre><p>这个 . 就是构建上下文的目录，你也可以指定别的路径。</p><p>而镜像自然是越小性能越好，所以 docker 支持你通过 .dockerignore 声明哪些不需要发送给 docker daemon。</p><p>.dockerignore 是这样写的：</p><pre><code>*.md
!README.md
node_modules/
[a-c].txt
.git/
.DS_Store
.vscode/
.dockerignore
.eslintignore
.eslintrc
.prettierrc
.prettierignore
</code></pre><p>*.md 就是忽略所有 md 结尾的文件，然后 !README.md 就是其中不包括 README.md</p><p>node_modules/ 就是忽略 node_modules 下 的所有文件</p><p>[a-c].txt 是忽略 a.txt、b.txt、c.txt 这三个文件</p><p>.DS_Store 是 mac 的用于指定目录的图标、背景、字体大小的配置文件，这个一般都要忽略</p><p>eslint、prettier 的配置文件在构建镜像的时候也用不到</p><p>此外，还有注释的语法：</p><p><img src="`+t+'" alt=""></p><p>这就是 dockerfile 的全部语法，没多少东西。</p><p><strong>docker build 时，会先解析 .dockerignore，把该忽略的文件忽略掉，然后把剩余文件打包发送给 docker daemon 作为上下文来构建产生镜像。</strong></p><p>这就像你在 git add 的时候，.gitignore 下配置的文件也会被忽略一样。</p><p>忽略这些用不到的文件，是为了让构建更快、镜像体积更小。</p><p>此外，还有一种减小镜像体积的手段：多阶段构建。</p><p>我们会先把源码目录发送到 docker daemon 中执行 npm run build 来构建产物，之后再 node ./dist/main.js 把服务跑起来。</p><p>也就是这样：</p><p><img src="'+o+`" alt=""></p><p>新建个项目：</p><pre><code>nest new dockerfile-test -p npm
</code></pre><p>编写 .dockerignore：</p><pre><code>*.md
node_modules/
.git/
.DS_Store
.vscode/
.dockerignore
</code></pre><p>编写 Dockerfile：</p><pre><code>FROM node:18

WORKDIR /app

COPY package.json .

RUN npm config set registry https://registry.npmmirror.com/

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD [ &quot;node&quot;, &quot;./dist/main.js&quot; ]
</code></pre><p>基于 node 18 的镜像。</p><p>指定当前目录为容器内的 /app。</p><p>把 package.json 复制到容器里，设置淘宝的 npm registry，执行 npm install。</p><p>之后把其余的文件复制过去，执行 npm run build。</p><p>指定暴露的端口为 3000，容器跑起来以后执行 node ./dist/main.js 命令。</p><p>然后执行 docker build：</p><pre><code>docker build -t nest:first .
</code></pre><p>镜像名为 nest、标签为 first，构建上下文是当前目录</p><p><img src="`+l+'" alt=""></p><p>然后就可以在 docker desktop 里看到你构建出来的镜像了：</p><p><img src="'+r+'" alt=""></p><p>如果你 build 的时候报这个错误：</p><p><img src="'+d+`" alt=""></p><p>那需要加一行：</p><pre><code>RUN ln -s /sbin/runc /usr/bin/runc
</code></pre><p>原因如下：</p><p><img src="`+c+'" alt=""></p><p>点击 run 把它跑起来：</p><p><img src="'+k+'" alt=""></p><p>容器跑成功了：</p><p><img src="'+g+'" alt=""></p><p>浏览器访问下也没啥问题：</p><p><img src="'+h+'" alt=""></p><p>这样我们就用 docker 把我们的 nest 应用跑起来了！</p><p>但现在 docker 镜像还是不完美的。</p><p>这样构建出来的镜像有什么问题呢？</p><p>明显，src 等目录就不再需要了，构建的时候需要这些，但运行的时候只需要 dist 目录就可以了。</p><p><img src="'+m+`" alt=""></p><p>把这些文件包含在内，会让镜像体积变大。</p><p>那怎么办呢？</p><p>构建两次么？第一次构建出 dist 目录，第二次再构建出跑 dist/main.js 的镜像。那不是要两个 dockerfile？</p><p>确实需要构建两次，但只需要一个 dockerfile 就可以搞定。</p><p>这需要用到 dockerfile 的多阶段构建的语法。</p><pre><code># build stage
FROM node:18 as build-stage

WORKDIR /app

COPY package.json .

RUN npm config set registry https://registry.npmmirror.com/

RUN npm install

COPY . .

RUN npm run build

# production stage
FROM node:18 as production-stage

COPY --from=build-stage /app/dist /app
COPY --from=build-stage /app/package.json /app/package.json

WORKDIR /app

RUN npm install --production

EXPOSE 3000

CMD [&quot;node&quot;, &quot;/app/main.js&quot;]
</code></pre><p>通过 FROM 继承镜像的时候，给当前镜像指定一个名字，比如 build-stage。</p><p>然后第一个镜像执行 build。</p><p>之后再通过 FROM 继承 node 镜像创建一个新镜像。</p><p>通过 COPY --from-build-stage 从那个镜像内复制 /app/dist 的文件到当前镜像的 /app 下。</p><p>还要把 package.json 也复制过来，然后切到 /app 目录执行 npm install --production 只安装 dependencies 依赖</p><p>这个生产阶段的镜像就指定容器跑起来执行 node /app/main.js 就好了。</p><p>执行 docker build，打上 second 标签：</p><pre><code>docker build -t nest:second .
</code></pre><p><img src="`+_+'" alt=""></p><p>把之前的容器停掉，把这个跑起来：</p><p><img src="'+u+'" alt=""></p><p>这次用 3003 端口来跑：</p><p><img src="'+E+'" alt=""></p><p><img src="'+b+'" alt=""></p><p>浏览器访问下： <img src="'+y+'" alt=""></p><p>nest 服务跑成功了。</p><p>这时候 app 下就是有 dist 的文件、生产阶段的 node_modules、package.json 这些文件：</p><p><img src="'+D+'" alt=""></p><p>对比下镜像体积，明显看出有减小，少的就是 src、test、构建阶段的 node_modules 这些文件：</p><p><img src="'+f+`" alt=""></p><p>这就是多阶段构建（multi-stage build）的魅力。</p><p>有同学说，但现在镜像依然很大呀，那是因为我们用的基础的 linux 镜像比较大，可以换成 alpine 的，这是一个 linux 发行版，主打的就是一个体积小。</p><div class="language-docker vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">docker</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">FROM</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> node:18.0-alpine3.14 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> build-stage</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">WORKDIR</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /app</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">COPY</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> package.json .</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">RUN</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> npm install</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">COPY</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> . .</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">RUN</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> npm run build</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># production stage</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">FROM</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> node:18.0-alpine3.14 </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">as</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> production-stage</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">COPY</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> --from=build-stage /app/dist /app</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">COPY</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> --from=build-stage /app/package.json /app/package.json</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">WORKDIR</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /app</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">RUN</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> npm install --production</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">EXPOSE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 3000</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">CMD</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;node&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;/app/main.js&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span></code></pre></div><p>node:18-alpine3.14 就是用 alpine 的 linux 的 3.14 版本，用 node 的 18.0 版本。</p><p>然后再 docker build 一下。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>docker build -t nest:ccc .</span></span></code></pre></div><p><img src="`+R+'" alt=""></p><p>可以看到现在镜像体积只有 277M 了：</p><p><img src="'+O+'" alt=""></p><p>一般情况下，我们都会用多阶段构建 + alpine 基础镜像。</p><p><img src="'+F+'" alt=""></p><p>alpine 是一种高山植物，就是很少的养分就能存活，很贴合体积小的含义。</p><p>案例代码在<a href="https://github.com/QuarkGluonPlasma/nestjs-course-code/tree/main/nest-dockerfile" target="_blank" rel="noreferrer">小册仓库</a>。</p><h2 id="总结" tabindex="-1">总结 <a class="header-anchor" href="#总结" aria-label="Permalink to &quot;总结&quot;">​</a></h2><p>docker build 的时候会把构建上下文的所有文件打包发送给 docker daemon 来构建镜像。</p><p>可以通过 .dockerignore 指定哪些文件不发送，这样能加快构建时间，减小镜像体积。</p><p>此外，多阶段构建也能减小镜像体积，也就是 build 一个镜像、production 一个镜像，最终保留下 production 的镜像。</p><p>而且我们一般使用 alpine 的基础镜像，类似 node:18.10-aline3.14，这样构建出来镜像体积会小很多。</p><p>这就是用 Nest 项目构建 Docker 镜像的方式。</p>',108),P=[A];function j(N,S,q,v,M,U){return n(),p("div",null,P)}const T=s(C,[["render",j]]);export{I as __pageData,T as default};
