## install-modules命令模块
### 模块安装
```
yarn global add install-modules 或者
npm install install-modules -g
```
### 模块使用
#### 第一种使用方式
```
在一个文件夹下有多个项目，然后打开命令行工具，执行`install-modules`,会在此目录下生成一个package.json文件，此文件包含所有的项目的package.json的文件的依赖模块
然后会自动执行`yarn install`安装公用模块
安装完全局模块，会针对每一个项目安装项目特有的模块(比如版本和公共模块不一样的)
项目中如果有使用npm官网上被遗弃的模块被被迫停止，手动在package.json中删除遗弃模块然后再执行命令
```
#### 第二种使用方式
```
进入到项目根目录，然后执行`install-modules children`
此命令会安装此项目下除了公用package.json文件以外的特有的模块

```
* ![示例](https://github.com/forever-chen/install-modules/blob/master/img/example.jpg)
### 工具作用
* 对于本地多个项目由于每一个项目都要生成node_modules文件夹，有许多相同的依赖，多次安装占用空间太大
### [源码地址,有什么问题大家可以提出来，我随时修正](https://github.com/forever-chen/npm_modles/tree/master/install)