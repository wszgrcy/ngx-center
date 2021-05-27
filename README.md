# ngx-center

一个中心,多个......

# 这是什么?

- 一个共享 angular 运行时环境的解决方案

# 目前的打包构建方案

## 无懒加载

- 就是路由都是具名引用`{path:"xxx",component:XXXComponent}`

### 优点

- 不用想那么多,打包就是一个文件

### 缺点

- 所有功能一个文件,太大了
- 当项目足够大时,打包速度慢,内存占用高,开发时等待重新编译时间长

## 懒加载

- `{path:"xxx",loadChildren:()=>import('xxx').then((item)=>XXXModule)}`

### 优点

- 每个功能的路由只在请求时加载,减少文件加载

### 缺点

- 打包速度会相对增长一些
- 当项目足够大时,打包速度慢,内存占用高,开发时等待重新编译时间长
  > 会比`无懒加载`方式更容易达到上限

## 多 ng 实例

- 也就是通过自建的桥,连接了各 ng 项目
- 另一个名字叫做`微前端`

### 优点

- 解决了前面的速度问题
- 功能的添加/修改不需要编译整个项目,仅仅是各个被影响的模块
- 每个实例的依赖版本独立,互不影响
- 不仅是 ng,其他的也可以加载

### 缺点

- 每个实例自带一个 ng 运行实例,通讯只能依靠桥来连接
- 加载的时候,由于无依赖共享,每个项目大小过大

## 单运行时共享依赖(本项目实现)

- 通过 ng 自身的功能,依赖工程化,将各个项目独立打包
- 在整个项目可控的情况下,项目的主技术栈为 ng 时,纯 ng 的实现方案

### 优点

- 每个项目使用主项目的依赖(假如主项目有)
- 编译及开发时重新编译的粒度小,速度极快
- 解决`项目`被`主项目`加载时的代码变更重新编译后自动刷新问题
- 子项目也可以加载子项目,并且子项目同时可以使用`import`
  > 即子项目同时可以使用`主项目加载子项目`的方式加载子项目,也可以使用 ng 原始的懒加载方式编写逻辑
- 可以直接调用主项目的服务,模块及组件,同之前开发相比,开发无感知,不需要学习多余的东西
- 可以加载的子项目数量极多
  > 由于没有独立的运行时及一些组件库依赖,所以每个子项目只有运行逻辑,空间大小增长缓慢
- 理论上划分足够细是可以支持小内存打包的(因为子项目也可以引入子项目)

### 缺点

- 由于使用主项目的依赖,所以主项目的依赖部分不能摇树,不能进行变量名破坏,会使主项目比正常打包时的基本大小大一些
- 主项目变更导出依赖时,需要重启子项目

# 使用方法

- 依赖的是 Angular 的`ng generate`命令,快速生成开发骨架
- 建议先在新项目中使用,待了解实现后,再使用到已有项目中

## 主项目初始化

- 运行`npx ng g ngx-center:main-init`
- 配置

```ts
/**
 * 主项目初始化
 */
declare interface MainInitSchematics {
  /**
   * 链接库(lib)名称,默认dll
   */
  dllName?: string;
  /**
   * 主项目的名字(为空读取默认值)
   */
  projectName?: string;
  /**
   * 使用暴露webpack配置的方式(交互)
   */
  webpackMode?: string;
  /**
   * 将webpack提升到根依赖(yarn会默认提升)
   */
  webpackPromotion?: boolean;
}
```

- 除了`webpackMode`外,其他配置均为静默设置,除非使用`-xxx yyy`显式设置
- 运行完成后,可以先执行`npm run build:center-dll`生成 dll 库,在运行`npm run start:center-main`启动主项目
- 主项目的依赖一旦变更(引入,删除的话不需要,顶多会冗余),就需要重新生成`dll`(`npm run build:center-dll`).
- 如果主项目想导出某些命名给子项目使用(包括不限于 ts 正常语法导出,组件,指令,管道,模块,服务等),可以声明在`export-module.ts`文件中,声明方式为`export * from './xxx'`,同时子项目使用可以使用相对路径,但是也可以使用`impot {a} from "@center-main/.../xxx"`这种方式(@center-main 为默认主项目的 sourceRoot)
- 主项目的导出命名变化后(添加依赖),需要重启子项目
- 主项目使用子项目使用的是 ng 原生方法,懒加载,只不过懒加载的不是原来的 ts 文件,而是资源文件,示例:

```ts
RouterModule.forRoot([
  {
    path: 'sub1',
    loadChildren: () => {
      return fetch(`http://127.0.0.1:4201/bootstrap.json`)
        .then((item) => item.json())
        .then((res) => loadRemoteModuleManifest(res))
        .then((item) => item.module);
    },
  },
]);
```

## 子项目生成

- 运行`npx ng g ngx-center:sub`
- 配置

```ts
/**
 * 子项目生成
 */
declare interface SubSchematics {
  /**
   * 子项目的名字(交互)
   */
  name: string;
  /**
   * 主项目的名字(默认defaultProject)
   */
  mainProjectName?: string;
  /**
   * 使用暴露webpack配置的方式(交互)
   */
  webpackMode?: string;
  /**
   * 开发端口(交互,每一个子项目开发时独立占据一个端口)
   */
  port: number;
}
```

- 先启动主项目,等`center-dll`,`center-main`都启动成功后,再启动子项目
- 子项目的开发,与普通的开发完全一致,可以理解为,就是一个独立的项目开发,支持所有你日程开发的操作(假如不是太离谱...)

## 构建生成

- 参考命令,先构建,再讲子项目复制进主项目文件夹中

```json
{
  "deploy": "yarn build:center-dll:prod&&yarn build:center-main:prod&&yarn build:sub1:prod&&cpx \"dist/sub1/**/*\" dist/ng-cli-plugin/sub1"
}
```

- 如果你的部署文件存放有要求,可以修改`angular.json`中子项目的`deployUrl`配置,改为你要放的子文件夹位置,然后再将命令修改为复制到对应的位置即可,当然主项目中的请求路径也要相应修改
  > 比如,原项目为`deployUrl:'sub1'`,想放到主文件夹中的`router/sub1`中,那么就要修改`deployUrl:'router/sub1'`,同时,代码请求部分也改成`fetch('router/sub1/bootstrap.json')`,复制到`cpx \"dist/sub1/**/*\" dist/ng-cli-plugin/router/sub1`
  > 如果没有要求,默认子项目名与部署地址位置相同

## demo 参考

- 源码地址:[https://github.com/wszgrcy/ng-cli-plugin-demo](https://github.com/wszgrcy/ng-cli-plugin-demo)
- 演示地址:[https://wszgrcy.github.io/ng-cli-plugin-demo/](https://wszgrcy.github.io/ng-cli-plugin-demo/)

# 注意事项

- tsconfig 有独立进行配置的开发者,请自行修改由原理图(schematics)生成的相关配置,因为可能与您具体使用场景不同
- 声明文件名如果与默认不同(typings.d.ts),也需要自行复制或添加到 tsconfig 中
- 如果使用非`@angular-builders/custom-webpack`作为 webapck 配置的导出,也请自行根据生成的文件修改为您自身的 builder 需要的格式,暂时没有安排适配其他 builder.如果是使用官方的 webpack builder 直接复制里面的配置就好了,没有什么魔法配置

# 常见问题

- 主项目路由声明了子项目访问,也点击访问子项目路由了,导航地址已经变化,但是没有任何报错,也没有任何反应
  > 可能需要重新构建`center-dll`,因为 ng 项目初始化时,你没有选择生成路由,这就导致了构建`center-dll`时,`@angular/router`没有在`center-dll`中,所以子项目,主项目用的两套路由依赖,所以出的问题
- 构建警告,如下:

```bash
Warning: /Users/chen/my-project/ng-cli-plugin-demo/src/polyfills.ts is part of the TypeScript compilation but it's unused.
Add only entry points to the 'files' or 'include' properties in your tsconfig.
```

> 当声明了`polyfills`,`styles`等文件(可能也有导出依赖),但是在构建时将入口去掉后,ng 的自身检查机制,目前通过`ngx-center`构建的,基本上已经规避这个问题,即使不规避也没问题,只不过警告看的难受

- 构建警告,如下:

```bash
/Users/chen/my-project/ng-cli-plugin-demo/src/app/show-in-main/show-in-main.component.ts 没有使用引用
```

> 这个是检查插件`NgNamedImportCheckPlugin`在起作用,因为主项目和子项目并不是强关联,有时候开发可能不自觉的引用了一些没有到导出的,虽然构建不会报错,但是会直接引用主项目的代码,也就是生成了两份,这时就需要将报警告的文件加入到`export-module.ts`中,不需要加绝对路径,只需要相对引用就 ok 了

- 在主项目加入一个导出到`export-module.ts`中后,子项目引用没有找到.

> 重启子项目即可,如果重启依然复现,请检查其他原因

- 子项目出现某些模块,明明引入了,但是不知道为啥使用对应组件时报错

> 重启子项目,具体原因未知,似乎是使用导出这种方式后,ng 没有对应的检查更新,但是重启就会好了,出现概率较低,已知就是如果使用自定义表单控件模块,先使用,再引入就有可能发生...,但是,如果重启后依旧出现问题,那么就不是这个问题导致的,请排查其他问题

- 构建异常,如下:

```bash
An unhandled exception occurred: Dll Reference Plugin Invalid Options

options.manifest.content should NOT have fewer than 1 properties
options.manifest.content should match some schema in anyOf
options.manifest should be string
options.manifest should match exactly one schema in oneOf
options should NOT have additional properties
options should have required property 'content'
options should have required property 'name'
options should match some schema in anyOf
```

> 导出模块`export-module.ts`未导出任何命名,请添加一个,或者移除这个功能(搜索`export-module`,移除相关代码及文件即可)
