#!/usr/bin/env node

const process = require('process')
const getNpmPackageVersion = require('get-npm-package-version')
const chalk = require('chalk');
const program = require('commander')
const package = require('./package.json')
process.stdin.setEncoding('utf8')
program
    .version(package.version, '-v, --version')
    .version(package.version, '-V, --version')
    .version(package.version, '-version, --version')
    .action(name => {
        projectName = name;
    })
    .on('--help', () => {
        console.log(`可以直接使用命令 ${chalk.blue('install-modules')}`);
    })
    .parse(process.argv)
const lastestVersion = getNpmPackageVersion('install-modules')
if(lastestVersion!==package.version){
    console.log(`${chalk.blue('install-modules')} 当前版本为 ${package.version}`)
    console.log()
    console.log(`${chalk.blue('install-modules')} 有最新版本 ${chalk.yellow(lastestVersion)} 请及时更新!`)
}
require('./install-modules')