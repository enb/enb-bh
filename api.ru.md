# API технологий

Пакет предоставляет следующие технологии:

* для сборки BH-шаблонов: [bh-bundle](#bh-bundle) или [bh-commonjs](#bh-commonjs);
* для генерации HTML: [bemjson-to-html](#bemjson-to-html).

## bh-bundle

Собирает `bh.js`-файлы блоков и ядро в один файл — `?.bh.js`-бандл, который используется для работы как на клиенте, так и на сервере. Не требует подключения исходных файлов шаблонов.

Поддерживает [YModules](https://ru.bem.info/tools/bem/modules/) и частично [CommonJS](http://www.commonjs.org/), так как в bh.js-файлах функция `require` не будет работать корректно.

Если в исполняемой среде нет ни одной модульной системы, то модуль будет предоставлен в глобальную переменную `BH`.

### Опции

* [target](#target)
* [filesTarget](#filestarget)
* [sourceSuffixes](#sourcesuffixes)
* [sourcemap](#sourcemap)
* [requires](#requires)
* [mimic](#mimic)
* [scope](#scope)
* [jsAttrName](#jsattrname)
* [jsAttrScheme](#jsattrscheme)
* [jsCls](#jscls)
* [jsElem](#jselem)
* [escapeContent](#escapecontent)
* [clsNobaseMods](#clsnobasemods)

### tmrget

Тип: `String`. По умолчанию: `?.bh.js`.

Имя таргета, куда будет записан результат сборки необходимых `bh.js`-файлов проекта — скомпилированный файл `?.bh.js`.

#### filesTarget

Тип: `String`. По умолчанию: `?.files`.

Имя таргета, откуда будет доступен список исходных файлов для сборки. Список файлов предоставляет технология [files](https://ru.bem.info/tools/bem/enb-bem-techs/readme/#files) пакета [enb-bem-techs](https://ru.bem.info/tools/bem/enb-bem-techs/readme/).

#### sourceSuffixes

Тип: `String | String[]`. По умолчанию: `['bh.js']`.

Суффиксы файлов, по которым отбираются файлы с BH-шаблонами для дальнейшей сборки.

#### sourcemap

Тип: `Boolean`. По умолчанию: `false`.

Построение карт кода (source maps) с информацией об исходных файлах. Карты встраиваются в скомпилированный файл `?.files`, а не хранятся в отдельном файле с расширением `.map`.

#### requires

Тип: `Object`. По умолчанию: `{}`.

Задает имена или пути для подключения внешних библиотек в пространстве имен `bh.lib` — `bh.lib.name`.

>Принцип работы описан в разделе [Подключение сторонних библиотек](README.md#Особенности-работы-пакета).

#### mimic

Тип: `String | String[]`. По умолчанию — `[]`.

Задает имена новых переменных.

>Принцип работы описан в разделе [Мимикрия под BEMHTML](README.md#Мимикрия-под-bemhtml).

#### scope

Тип: `String`. По умолчанию: `template`.

Задает область видимости для исходного кода шаблонов.

Возможные значения:

* `template` — изолирует выполнение шаблонов друг от друга;
* `global`— позволяет выполнять шаблоны в общей области видимости.

#### jsAttrName

Тип: `String`. По умолчанию: `data-bem`.

Опция шаблонизатора BH. [Описание](https://ru.bem.info/technology/bh/current/about/#jsattrname).

#### jsAttrScheme

Тип: `String`. По умолчанию: `json`.

Опция шаблонизатора BH. [Описание](https://ru.bem.info/technology/bh/current/about/#jsattrscheme).

#### jsCls

Тип: `String | Boolean`. По умолчанию: `i-bem`.

Опция шаблонизатора BH. [Описание](https://ru.bem.info/technology/bh/current/about/#jscls).

#### jsElem

Тип: `Boolean`. По умолчанию: `true`.

Опция шаблонизатора BH. [Описание](https://github.com/bem/bh/blob/master/README.md#jselem).

#### escapeContent

Тип: `Boolean`. По умолчанию: `false`.

Опция шаблонизатора BH. [Описание](https://ru.bem.info/technology/bh/current/about/#escapecontent).

#### clsNobaseMods

Тип: `Boolean`. По умолчанию: `false`.

Опция шаблонизатора BH. [Описание](https://github.com/bem/bh/blob/master/README.md#clsnobasemods).

--------------------------------------
**Пример**

```javascript
var BHBundleTech = require('enb-bh/techs/bh-bundle'),
    FileProvideTech = require('enb/techs/file-provider'),
    bem = require('enb-bem-techs');

 module.exports = function(config) {
     config.node('bundle', function(node) {
         // Получает FileList
         node.addTechs([
             [FileProvideTech, { target: '?.bemdecl.js' }],
             [bem.levels, levels: ['blocks']],
             bem.deps,
             bem.files
         ]);

         // Создает BH-файл
         node.addTech(BHBundleTech);
         node.addTarget('?.bh.js');
     });
 };
```

## bh-commonjs

Собирает `bh.js`-файлы блоков с помощью `require` в один файл — `?.bh.js`-бандл. Предназначен для исполнения в Node.js. После сборки требуется наличие всех файлов, подключенных с помощью `require`.

Результат сборки — `?.bh.js`-файл, который содержит подключения необходимых исходных `bh.js`-файлов и файла ядра из `node_modules`.

В шаблоны зависимости подключаются с помощью `require`. Все пути обрабатываются относительно того файла, в котором прописан `require`.

### Опции

* [target](#target-1)
* [filesTarget](#filestarget-1)
* [sourceSuffixes](#sourcesuffixes-1)
* [devMode](#devmode)
* [mimic](#mimic)
* [jsAttrName](#jsattrname)
* [jsAttrScheme](#jsattrscheme)
* [jsCls](#jscls)
* [jsElem](#jselem)
* [escapeContent](#escapecontent)
* [clsNobaseMods](#clsnobasemods)

#### target

Тип: `String`. По умолчанию: `?.bh.js`.

Имя таргета, куда будет записан результат сборки необходимых `bh.js`-файлов проекта — скомпилированный файл `?.bh.js`.

#### filesTarget

Тип: `String`. По умолчанию: `?.files`.

Имя таргета, откуда будет доступен список исходных файлов для сборки. Список файлов предоставляет технология [files](https://ru.bem.info/tools/bem/enb-bem-techs/readme/#files) пакета [enb-bem-techs](https://ru.bem.info/tools/bem/enb-bem-techs/readme/).

#### sourceSuffixes

Тип: `String | String[]`. По умолчанию: `['bh.js']`.

Суффиксы файлов, по которым отбираются файлы с BH-шаблонами для дальнейшей сборки.

#### devMode

Тип: `Boolean`. По умолчанию: `true`.

Режим сборки, при котором каждое новое подключение собранного файла инициирует сброс кэша `require` для всех внутренних файлов. Это позволяет видеть изменения в шаблонах без перезапуска Node.js.

#### mimic

Тип: `String | Array`. По умолчанию: `[]`.

Задает имена новых переменных.

>Принцип работы описан в разделе [Мимикрия под BEMHTML](README.md#Мимикрия-под-bemhtml).

#### jsAttrName

Тип: `String`. По умолчанию: `data-bem`.

Опция шаблонизатора BH. [Описание](https://ru.bem.info/technology/bh/current/about/#jsattrname).

Атрибут блока с параметрами инициализации.

#### jsAttrScheme

Тип: `String`. По умолчанию: `json`.

Опция шаблонизатора BH. [Описание](https://ru.bem.info/technology/bh/current/about/#jsattrscheme).

#### jsCls

Тип: `String | Boolean`. По умолчанию: `i-bem`.

Опция шаблонизатора BH. [Описание](https://ru.bem.info/technology/bh/current/about/#jscls).

#### jsElem

Тип: `Boolean`. По умолчанию: `true`.

Опция шаблонизатора BH. [Описание](https://github.com/bem/bh/blob/master/README.md#jselem).

#### escapeContent

Тип: `Boolean`. По умолчанию: `false`.

Опция шаблонизатора BH. [Описание](https://ru.bem.info/technology/bh/current/about/#escapecontent).

#### clsNobaseMods

Тип: `Boolean`. По умолчанию: `false`.

Опция шаблонизатора BH. [Описание](https://github.com/bem/bh/blob/master/README.md#clsnobasemods).

--------------------------------------
**Пример**

```javascript
var BHCommonJSTech = require('enb-bh/techs/bh-commonjs'),
    FileProvideTech = require('enb/techs/file-provider'),
    bem = require('enb-bem-techs');

module.exports = function(config) {
    config.node('bundle', function(node) {
        // Получает FileList
        node.addTechs([
            [FileProvideTech, { target: '?.bemdecl.js' }],
            [bem.levels, levels: ['blocks']],
            bem.deps,
            bem.files
        ]);

        // Собирает BH-файл
        node.addTech(BHCommonJSTech);
        node.addTarget('?.bh.js');
    });
};
```

## bemjson-to-html

Предназначен для сборки HTML-файла. Принимает на вход [BEMJSON](https://ru.bem.info/technology/bemjson/current/bemjson/) и скомпилированный `?.bh.js`-файл (результат работы технологий [bh-bundle](#bh-bundle) или [bh-commonjs](#bh-commonjs)), возвращает HTML.

### Опции

* [bhFile](#bhfile)
* [bemjsonFile](#bemjsonfile)
* [target](#target-2)

#### bhFile

Тип: `String`. По умолчанию: `?.bh.js`.

Имя файла, в котором содержится шаблон, скомпилированный одной из технологий ([bh-bundle](#bh-bundle) или [bh-commonjs](#bh-commonjs)). Используется для преобразования BEMJSON в HTML.

#### bemjsonFile

Тип: `String`. По умолчанию: `?.bemjson.js`.

Имя BEMJSON-файла, к которому применится скомпилированный шаблон `?.bh.js` (результат работы технологий [bh-bundle](#bh-bundle) или [bh-commonjs](#bh-commonjs)) для получения HTML.

#### target

Тип: `String`. По умолчанию: `?.html`.

HTML-файл — результат применения скомпилированного шаблона к указанному BEMJSON-файлу.

---------------------------------
**Пример**

```javascript
var BemjsonToHtmlTech = require('enb-bh/techs/bemjson-to-html'),
    BHCommonJSTech = require('enb-bh/techs/bh-commonjs'),
    FileProvideTech = require('enb/techs/file-provider'),
    bem = require('enb-bem-techs');

module.exports = function(config) {
    config.node('bundle', function(node) {
        // Получает BEMJSON-файл
        node.addTech([FileProvideTech, { target: '?.bemjson.js' }]);

        // Получает FileList
        node.addTechs([
            [bem.levels, levels: ['blocks']],
            bem.bemjsonToBemdecl,
            bem.deps,
            bem.files
        ]);

        // Собирает BH-файл
        node.addTech(BHCommonJSTech);
        node.addTarget('?.bh.js');

        // Создает HTML-файл
        node.addTech(BemjsonToHtmlTech);
        node.addTarget('?.html');
    });
};
```
