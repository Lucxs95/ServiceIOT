let  fs = require('fs');
let  join = require('path').join;
const child_process = require('child_process')
const chalk = require('chalk');
const { createImportSpecifier } = require('typescript');
console.log(process.argv[1])
let dirVar= []
if(process.argv[2] === 'children'){
    excuteChildrenCommand()
}else{
    excuteGlobalComand()
}
function isFileExists(filePath){
    var bool = !0;
    try{
      fs.accessSync(filePath,fs.F_OK);
    }catch(err){
      bool = !1;
    }
    return bool;
}

function getRootPackageJson(dir){
    // dirVar = dir
    let packageJsonDir = dir.split('\\').slice(0,-1).join('\\')
    console.log(333,packageJsonDir)
    if(packageJsonDir&&isFileExists(join(packageJsonDir,'./package.json'))){
        getRootPackageJson(packageJsonDir)
    }
    
    dirVar.push(join(dir,'package.json'))
    return dirVar
}
// 执行全局命令
function excuteGlobalComand(){
    
    if(isFileExists('./package.json')){
        fs.unlinkSync('./package.json')
    }
    /**
     * @param startPath  起始目录文件夹路径
     * @returns {Array}
     */
    let packageJsonList = []
    function findSync(startPath) {
        let result=[];
        function finder(path) {
            let files=fs.readdirSync(path);
            files.forEach((val,index) => {
                let fPath=join(path,val);
                let stats=fs.statSync(fPath);
                if(stats.isDirectory()&&!fPath.includes('node_modules')&&!fPath.includes('.git')) finder(fPath)
                if(stats.isFile()) result.push(fPath);
            });
    
        }
        finder(startPath);
        return result;
    }
    console.log()
    console.log(chalk.green('正在读取package.json文件……'))
    let fileNames=findSync('./').filter(items=>items.includes('package.json'));
    console.log()
    console.log(chalk.green('读取package.json文件结束'))
    console.log()
    console.log(chalk.green('正在生成新的package.json文件……'))
    let dependencies = {}
    let devDependencies = {}
    fileNames&&fileNames.map((item)=>{
        // item.repalce(/\/\//,'/');
        // const json = require(`./${item.replace('/','/')}`)
        item = `./${item.replace(/\\/g,'/')}`
        if(item.endsWith('package.json')){
            const json = JSON.parse(fs.readFileSync(item,'utf-8'))
            dependencies ={...dependencies,...json.dependencies}
            if(json.commonDependencies){
                dependencies = {...dependencies,...json.commonDependencies}
            }
            if(json.devDependencies){
                devDependencies = {...devDependencies,...json.devDependencies}
            }
        }
    })
    fileNames&&fileNames.map((item)=>{
        item = `./${item.replace(/\\/g,'/')}`
        const json = JSON.parse(fs.readFileSync(item,'utf-8'))
        let depStr = ''
        json.dependencies&&Object.keys(json.dependencies).map((list)=>{
            if(json.dependencies[list]!==dependencies[list]){
                depStr+=` ${list}@${json.dependencies[list]}`
            }
        })
        let devStr = ''
        json.devDependencies&&Object.keys(json.devDependencies).map((list)=>{
            if(json.devDependencies[list]!==devDependencies[list]){
                devStr+=` ${list}@${json.devDependencies[list]}`
            }
        })
        if(!depStr&&!devStr) return
        let command = []
        if(depStr) command.push('yarn add'+depStr)
        if(devStr) command.push('yarn add --dev'+depStr)
        packageJsonList.push({dir:item.replace('package.json',''),command:command})
        // fs.writeFileSync(item.replace('package.json','')+'extra.txt',str,'utf8')
    })
    
    let package = require('./template/package.json')
    // 删除遗弃的包
    delete dependencies['@babel/polyfill']
    delete devDependencies['@babel/polyfill']
    delete dependencies['request']
    delete devDependencies['request']
    delete dependencies['eslint-loader']
    delete devDependencies['eslint-loader']
    delete dependencies['@angular/http']
    delete devDependencies['@angular/http']
    
    package.dependencies = {...dependencies,...devDependencies}
    
    console.log()
    console.log(chalk.green('已经生成package.json文件'))
    fs.writeFileSync('./package.json',JSON.stringify(package),'utf8')
    console.log()
    console.log(chalk.green('正在下载所需要的包，请稍等……'))
    
    child_process.execSync(`yarn install`)
    console.log(chalk.green('全局包下载完成'))
    packageJsonList.map(item=>{
        console.log(chalk.green(`开始下载${join(process.cwd(),item.dir)}目录下版本不同的包，请稍等……`))
        item.command.map(li=>{
            child_process.execSync(`cd ${join(process.cwd(),item.dir)}`)
            child_process.execSync(li)
        })
        console.log(chalk.green(`${join(process.cwd(),item.dir)}目录下版本不同的包下载完成`))
    })
    console.log(chalk.green('所有包下载完成'))
    console.log(packageJsonList)
}
// 在子项目中执行命令
function excuteChildrenCommand(){
    const rootdir = getRootPackageJson(process.cwd())
    const rootpakageJson = fs.readFileSync(rootdir[0],'utf-8')
    const currentPackageJson = fs.readFileSync('./package.json','utf-8')
    console.log(rootdir[0])
    console.log(rootpakageJson)
    console.log(currentPackageJson)
    let currentDepend = currentPackageJson.dependencies
    let currentDevDepend = currentPackageJson.devDependencies
    let currentCommondepend = currentPackageJson.commonDependencies

    let depStr = ''
    currentDepend&&Object.keys(currentDepend).map((list)=>{
        if(currentDepend[list]!==rootpakageJson.dependencies[list]){
            depStr+=` ${list}@${currentDepend[list]}`
        }
    })
    currentCommondepend&&Object.keys(currentCommondepend).map((list)=>{
        if(currentCommondepend[list]!==rootpakageJson.dependencies[list]){
            depStr+=` ${list}@${currentCommondepend[list]}`
        }
    })
    let devStr = ''
    currentDevDepend&&Object.keys(currentDevDepend).map((list)=>{
        if(currentDevDepend[list]!==rootpakageJson.dependencies[list]){
            devStr+=` ${list}@${currentDevDepend[list]}`
        }
    })
    console.log(chalk.green(`开始安装${depStr} ${devStr}模块`))
    // if(depStr){
    //     child_process.execSync(`yarn install ${depStr}`)

    // }
    // if(devStr){
    //     child_process.execSync(`yarn install --dev ${devStr}`)
    // }
    console.log(chalk.green(`安装结束`))

}
