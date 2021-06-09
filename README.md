# ngx-center

一个中心,多个......
- [使用介绍(视频)](https://www.bilibili.com/video/BV1cq4y1L77i/)
# 这是什么?

- 一个 Angular 单运行时共享依赖的解决方案
- 只启动一个 Angular 平台(`PlatformRef`),其他子项目进行导出(类 es6 module),通过资源文件清单(或单独 js 文件)进行请求加载

# 功能

- 支持子项目在开发时代码变更的刷新
- 支持子项目调用主项目导出的命名(`export * from 'xxx'`)
- 支持子项目及主项目的 splitChunks(包括懒加载等...)
- 支持懒加载路由的子项目请求及其他动态模块的请求
- 支持`可信`的`远程`子项目开发
- 不需要了解各种概念,因为导出导入处理完全遵循`动态import`的类处理方案
- 子模块构建速度极快,且在大多数时间不需要向 node 申请内存
- 理论上子项目同时可以加载子项目,也就是可以存在多层级子项目的加载
- 可以通过子项目嵌套其他框架支持的调用
- 通过在编译时构建构成关系,对源代码无侵入性,不需要过多改造

# 依赖

- Angular10 Angular11 Angular12
- node12+

# 原理

## 依赖共享

- 也就是`node_modules`中的依赖变成 dll(动态链接库),主,子应用都使用这个 dll 保证实例的一致性

## 命名共享

- 主项目的命名会导出,供子项目用,实现子项目调用主项目的组件/模块/服务/管道等 ng 与非 ng 的导出

## 子项目资源启动

- 主项目通过启动子项目的资源文件/资源配置,来加载子项目资源,并且在加载后实现自动获得子项目的导出,可以作为懒加载路由,懒加载模块等动态使用的地方调用

# 使用方法

- 本项目依赖的是 Angular 的`ng generate`命令,快速生成开发骨架
- 相关插件可在在`webpack-ng-dll-plugin`,`'webpack-bootstrap-assets-plugin`查看,或者可手动配置文件
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
- 运行完成后,可以先执行`npm run build:center-dll`生成 dll 库,再运行`npm run start:center-main`启动主项目
  > 如依赖无变更,每次可仅启动`npm run start:center-main`
- 主项目的依赖一旦变更,就需要重新生成`dll`(`npm run build:center-dll`).
- 如果主项目想导出某些命名给子项目使用(包括不限于 ts 正常语法导出,组件,指令,管道,模块,服务等),可以声明在`export-module.ts`文件中,声明方式为`export * from './xxx'`,同时子项目使用可以使用相对路径,但是也可以使用`impot {a} from "@center-main/.../xxx"`这种方式(`@center-main` 为配置 tsconfig 中的 paths,默认主项目的 sourceRoot)
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
- 子项目的开发,与普通的开发完全一致,可以理解为,就是一个独立的项目开发,支持所有你日常开发的操作

## 远程子项目生成

- 新建项目
- 安装`ngx-center`
- 在新建的项目中运行`npx ng g ngx-center:remote-sub-init`
- 获得主项目`manifest.json`(依赖),`main-manifest.json`(项目导出命名)
- 如果需要使用主项目服务,则需要建立虚拟主项目(即建立与原主项目导出层级相同的文件),文件中只需要将类型配置正确即可.

  > 如导出一个文件,那么就需要建立一个层级相同的路径,使最后的资源引用上下文与资源文件 json 中的路径结合时,能找到这个文件即可
  > 导出模块组件(指令,管道)使用时,只需要指定下 selector 及公开属性,方便提示即可,
  > 虚拟主项目相当于一个桩只要 ng 的 loader 通过,就没有用了

- 最后由主项目调用远程子项目的资源清单(或者直接拿到资源内容)即可和普通的子项目一同使用

### 注意事项

- 子项目的依赖要和主项目保持一样(最好是指定版本)
- 主项目资源清单变化时(增加/减少依赖),需要同步子项目资源清单保持一致

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
- 远程子项目演示:[https://wszgrcy.github.io/ng-window/](https://wszgrcy.github.io/ng-window/)

# 注意事项

- tsconfig 有独立进行配置的开发者,请自行修改由原理图(schematics)生成的相关配置,因为可能与您具体使用场景不同
- 声明文件名如果与默认不同(typings.d.ts),也需要自行复制或添加到 tsconfig 中
- 如果使用非`@angular-builders/custom-webpack`作为 webapck 配置的导出,也请自行根据生成的文件修改为您自身的 builder 需要的格式,暂时没有安排适配其他 builder.

# 常见问题

1. 主项目路由声明了子项目访问,也点击访问子项目路由了,导航地址已经变化,但是没有任何报错,也没有任何反应
   > 可能需要重新构建`center-dll`,因为 ng 项目初始化时,如果你没有选择生成路由,这就导致了构建`center-dll`时,`@angular/router`没有在`center-dll`中,所以子项目,主项目用的两套路由依赖,所以出的问题
2. 构建警告,如下:

```bash
Warning: /Users/chen/my-project/ng-cli-plugin-demo/src/polyfills.ts is part of the TypeScript compilation but it's unused.
Add only entry points to the 'files' or 'include' properties in your tsconfig.
```

> 当声明了`polyfills`,`styles`等文件(可能也有导出依赖),但是在构建时将入口去掉后,ng 的自身检查机制,目前通过`ngx-center`构建的,基本上已经规避这个问题,即使不规避也没问题,只不过警告看的难受

3. 构建警告,如下:

```bash
/Users/chen/my-project/ng-cli-plugin-demo/src/app/show-in-main/show-in-main.component.ts  not export from main project!
```

> 这个是检查插件`NgNamedImportCheckPlugin`在起作用,因为主项目和子项目并不是强关联,有时候开发可能不自觉的引用了一些没有到导出的,虽然构建不会报错,但是会直接引用主项目的代码,也就是生成了两份,这时就需要将报警告的文件加入到`export-module.ts`中,不需要加绝对路径,只需要相对引用就 ok 了

4. 在主项目加入一个导出到`export-module.ts`中后,子项目引用没有找到.

> 重启子项目即可,如果重启依然复现,请检查其他原因

5. 子项目出现某些模块,明明引入了,但是不知道为啥使用对应组件时报错

> 重启子项目,具体原因未知,似乎是使用导出这种方式后,ng 没有对应的检查更新,但是重启就会好了,出现概率较低,已知就是如果使用自定义表单控件模块,先使用,再引入就有可能发生...,但是,如果重启后依旧出现问题,那么就不是这个问题导致的,请排查其他问题

6. 构建异常,如下:

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
