enb-bh
======

[![NPM version](https://img.shields.io/npm/v/enb-bh.svg?style=flat)](https://www.npmjs.org/package/enb-bh)
[![Build Status](https://img.shields.io/travis/enb-bem/enb-bh/master.svg?style=flat&label=tests)](https://travis-ci.org/enb-bem/enb-bh)
[![Build status](https://img.shields.io/appveyor/ci/blond/enb-bh.svg?style=flat&label=windows)](https://ci.appveyor.com/project/blond/enb-bh)
[![Coverage Status](https://img.shields.io/coveralls/enb-bem/enb-bh.svg?style=flat)](https://coveralls.io/r/enb-bem/enb-bh?branch=master)
[![Dependency Status](https://img.shields.io/david/enb-bem/enb-bh.svg?style=flat)](https://david-dm.org/enb-bem/enb-bh)

Пакет предоставляет набор ENB-технологий для сборки BH-шаблонов в проектах, построенных по [методологии БЭМ](https://ru.bem.info/method/).

Пакет `enb-bh` поддерживает версию [шаблонизатора BH](https://ru.bem.info/technology/bh/current/about/)  `4.1.0` или выше.

Технологии:

* [bh-bundle](#bh-bundle-1)
* [bh-commonjs](#bh-commonjs-1)
* [bemjson-to-html](#bemjson-to-html)

## Установка:

**Требования:** зависимость от пакета `enb` версии `0.12.0` или выше.

```sh
$ npm install --save-dev enb-bh
```

## Принципы работы пакета

В БЭМ-методологии шаблоны к каждому блоку хранятся в отдельных файлах с расширением `bh.js` в директориях блоков.

Пакет `enb-bh` собирает отдельные файлы с шаблонами (bh.js) в один общий файл с помощью одной из следующих технологий:

* [bh-bundle](#bh-bundle-1)
* [bh-commonjs](#bh-commonjs-1)

Обе технологии выполняют сборку BH-шаблонов, но разными способами.

Технология [bemjson-to-html](#bemjson-to-html) используется для генерации финального HTML-файла с помощью предварительно скомпилированных шаблонов.

## Использование

Результат работы технологий [bh-bundle](#bh-bundle-1) или [bh-commonjs](#bh-commonjs-1) — это скомпилированный файл с расширением `?.bh.js`. Способы его использования зависят от наличия модульной системы и ее типа.

Скомпилированный шаблон `?.bh.js` также используется как промежуточный этап для построения HTML. Применяется в технологии [bemjson-to-html](#bemjson-to-html).

Возможные варианты использования:

* [в Node.js](#server-side);
* [в браузере](#client-side);
* [для сборки финального HTML](#html-build).

<a name="server-side"></a>
### Исполнение шаблонов на Node.js

Для Node.js скомпилированный `?.bh.js`-файл подключается как модуль в формате [CommonJS](http://www.commonjs.org/).

```js
var BH = require('bundle.bh.js'); // Путь до скомпилированного файла

BH.apply({ block: 'button' });
```

### Исполнение шаблонов в браузере

Файл `?.bh.js` подключается на страницу как JavaScript-файл.

```html
<script src="bundle.bh.js"></script>
```

В браузере исполнение шаблонов зависит от наличия модульной системы.

<a name="client-side"></a>
#### Без модульной системы

Шаблоны доступны из глобальной переменной `BH`.

```js
BH.apply({ block: 'button' });
```

<a name="client-side-ym"></a>
#### С модульной системой YModules

Шаблоны доступны из модульной системы ([YModules](https://ru.bem.info/tools/bem/modules/)):

```js
modules.require(['BH'], function(BH) {
    BH.apply({ block: 'button' })
});
```

<a name="html-build"></a>
### Шаблоны как этап сборки HTML

Сборка финального `?.html`-файла с помощью `enb-bh` проходит в два этапа:

1. Технологии [bh-bundle](#bh-bundle-1) или [bh-commonjs](#bh-commonjs-1) собирают общий `?.bh.js`-файл.
2. Технология [bemjson-to-html](#bemjson-to-html) принимает на вход [BEMJSON](https://ru.bem.info/technology/bemjson/current/bemjson/) и скомпилированный `?.bh.js`-файл, возвращает `?.html`-файл.

HTML – результат применения скомпилированного шаблона к указанному BEMJSON-файлу.

<a name="libs-add"></a>
## Подключение сторонних библиотек

Технологии [bh-bundle](#bh-bundle-1) и [bh-commonjs](#bh-commonjs-1) поддерживают возможность подключения сторонних библиотек.

Способы подключения для каждой технологии отличаются.

### bh-bundle

Технология `bh-bundle` позволяет подключать библиотеки как глобально, так и для разных модульных систем с помощью опции [requires](#requires).

Для подключения укажите название библиотеки и имена модулей или пути к ним для модульных систем.

```js
{
    requires: {
        'lib-name': {
            globals: 'dependName',      // Название переменной в глобальной видимости
            ym: 'depend-name',          // Имя модуля из YModules
            commonJS: 'path/to/module'  // Путь к модулю CommonJS относительно собираемого файла
        }
    }
}
```

В шаблонах модули будут доступны из пространства имен `bh.lib`, например:

```js
var lib = bh.lib['lib-name'];

bh.match('block', function (ctx) {
    var text = lib.hello();

    ctx.content(text);
});
```

Можно указать зависимости глобально для всех модульных систем. В этом случае модуль всегда будет передаваться из глобальной переменной, даже если в среде исполнения будет модульная система.

```js
{
    requires: {
        'lib-name': {
            globals: 'dependName' // Название переменной в глобальной видимости
        }
    }
}
```

**Пример подключения библиотеки `moment`**

 Указывается название библиотеки и путь к модулю:

```js
{
    requires: {
        moment: {
            globals: 'moment',     // Имя переменной в глобальной видимости, куда будет предоставлен модуль `moment`
            commonJS: 'moment',    // Путь к модулю CommonJS относительно собираемого файла
        }
    }
}
```

В шаблонах модуль будет доступен из `bh.lib.moment`. Шаблон пишется одинаково для исполнения в браузере и в Node.js:

```js
var moment = bh.lib.moment;   // Библиотека `moment`

bh.match('post__date', function (ctx) {
    // Время в миллисекундах, полученное с сервера
    var date = moment(ctx.param.date).format('YYYY-MM-DD HH:mm:ss');

    ctx.content(date);
});
```

<a name="libs-add-commonjs"></a>
### bh-commonjs

В технологии `bh-commonjs` в шаблоне можно подключать библиотеки с помощью `require`:

```js
var lib = require('path/to/module'); // Путь до библиотеки
```

<a name="mimic"></a>
## Мимикрия под BEMHTML

БЭМ-платформа поддерживает два шаблонизатора: [BH](https://ru.bem.info/technology/bh/current/about/) и [BEMHTML](https://ru.bem.info/technology/bemhtml/current/rationale/). Они решают одну и ту же задачу: преобразуют [BEMJSON](https://ru.bem.info/technology/bemjson/current/bemjson/) в HTML.

Для возможности универсально писать JavaScript-код, совместимый с обоим шаблонизаторами, используется опция [mimic](#opt-mimic). Она позволяет использовать имена переменных BEMHTML, но по факту выполнять шаблоны BH.

## Технологии

* [bh-bundle](#bh-bundle-1)
* [bh-commonjs](#bh-commonjs-1)
* [bemjson-to-html](#bemjson-to-html)

<a name="bh-bundle"></a>
### bh-bundle

Собирает `bh.js`-файлы блоков и ядро в один файл — `?.bh.js`-бандл, который используется для работы как на клиенте, так и на сервере. Для правильного функционирования не требует подключения исходных файлов шаблонов.

Поддерживает [YModules](https://ru.bem.info/tools/bem/modules/) и частично [CommonJS](http://www.commonjs.org/), так как предполагается, что в `bh.js`-файлах не используется `require`.

Если в исполняемой среде нет ни одной модульной системы, то модуль будет предоставлен в глобальную переменную `BH`.

#### Опции

##### target

Тип: `String`. По умолчанию: `?.bh.js`.

Путь к таргету, куда будет записан результат сборки необходимых `bh.js`-файлов проекта — скомпилированный файл `?.bh.js`.

<a name="files-target"></a>
##### filesTarget

Тип: `String`. По умолчанию: `?.files`.

Путь к таргету, откуда будет доступен список исходных файлов для сборки. Список файлов предоставляет технология [files](https://ru.bem.info/tools/bem/enb-bem-techs/readme/#files) пакета [enb-bem-techs](https://ru.bem.info/tools/bem/enb-bem-techs/readme/).

##### sourceSuffixes

Тип: `String | String[]`. По умолчанию: `['bh.js']`.

Суффиксы файлов, по которым отбираются файлы с BH-шаблонами для дальнейшей сборки.

##### sourcemap

Тип: `Boolean`. По умолчанию: `false`.

Построение карт кода (source maps) с информацией об исходных файлах. Карты подключаются в скомпилированный файл `?.files`, а не хранятся в отдельном файле с расширением `.map`.

##### requires

Тип: `Object`. По умолчанию: `{}`.

Задает имена или пути для подключения внешних библиотек в пространстве имен `bh.lib` — `bh.lib.name`.

>Принцип работы описан в разделе [Подключение сторонних библиотек](#libs-add).

<a name="opt-mimic"></a>
##### mimic

Тип: `String | String[]`. По умолчанию — `[]`.

Задает имена новых переменных.

>Принцип работы описан в разделе [Мимикрия под BEMHTML](#mimic).

##### scope

Тип: `String`. По умолчанию: `template`.

Задает область видимости для исходного кода шаблонов.

По умолчанию каждый шаблон изолирован от всех других (значение `template`). Для выполнения всех шаблонов в общей области видимости, используйте значение опции `global`.

##### jsAttrName

Тип: `String`. По умолчанию: `data-bem`.

Опция шаблонизатора BH. [Описание](https://ru.bem.info/technology/bh/current/about/#jsattrname).

##### jsAttrScheme

Тип: `String`. По умолчанию: `json`.

Опция шаблонизатора BH. [Описание](https://ru.bem.info/technology/bh/current/about/#jsattrscheme).

##### jsCls

Тип: `String | Boolean`. По умолчанию: `i-bem`.

Опция шаблонизатора BH. [Описание](https://ru.bem.info/technology/bh/current/about/#jscls).

##### jsElem

Тип: `Boolean`. По умолчанию: `true`.

Опция шаблонизатора BH. [Описание](https://github.com/bem/bh/blob/master/README.ru.md#jselem).

##### escapeContent

Тип: `Boolean`. По умолчанию: `false`.

Опция шаблонизатора BH. [Описание](https://ru.bem.info/technology/bh/current/about/#escapecontent).

##### clsNobaseMods

Тип: `Boolean`. По умолчанию: `false`.

Опция шаблонизатора BH. [Описание](https://github.com/bem/bh/blob/master/README.ru.md#clsnobasemods).

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

### bh-commonjs

Собирает `bh.js`-файлы блоков с помощью `require` в один файл — `?.bh.js`-бандл. Предназначен для исполнения в Node.js. После сборки требуется наличие всех файлов, подключенных с помощью `require`.

Результат сборки — `?.bh.js`-файл, который состоит из подключений необходимых исходных `bh.js`-файлов и файла ядра из `node_modules`.

В шаблоны зависимости подключаются с помощью `require`. Все пути обрабатываются относительно того файла, в котором прописан `require`.

>Принцип подключения описан в разделе [Подключение сторонних библиотек](#bh-commonjs) для технологии `bh-commonjs`.

#### Опции

##### target

Тип: `String`. По умолчанию: `?.bh.js`.

Путь к таргету, куда будет записан результат сборки необходимых `bh.js`-файлов проекта — скомпилированный файл `?.bh.js`.

<a name="files-target"></a>
##### filesTarget

Тип: `String`. По умолчанию: `?.files`.

Путь к таргету, откуда будет доступен список исходных файлов для сборки. Список файлов предоставляет технология [files](https://ru.bem.info/tools/bem/enb-bem-techs/readme/#files) пакета [enb-bem-techs](https://ru.bem.info/tools/bem/enb-bem-techs/readme/).

##### sourceSuffixes

Тип: `String | String[]`. По умолчанию: `['bh.js']`.

Суффиксы файлов, по которым отбираются файлы с BH-шаблонами для дальнейшей сборки.

##### devMode

Тип: `Boolean`. По умолчанию: `true`.

Режим сборки, при котором каждое новое подключение собранного файла инициирует сброс кэша `require` для всех внутренних файлов. Это позволяет видеть изменения в шаблонах без перезапуска Node.js.

##### mimic

Тип: `String | Array`. По умолчанию: `[]`.

Задает имена новых переменных.

>Принцип работы описан в разделе [Мимикрия под BEMHTML](#mimic).

##### jsAttrName

Тип: `String`. По умолчанию: `data-bem`.

Опция шаблонизатора BH. [Описание](https://ru.bem.info/technology/bh/current/about/#jsattrname).

Атрибут блока с параметрами инициализации.

##### jsAttrScheme

Тип: `String`. По умолчанию: `json`.

Опция шаблонизатора BH. [Описание](https://ru.bem.info/technology/bh/current/about/#jsattrscheme).

##### jsCls

Тип: `String | Boolean`. По умолчанию: `i-bem`.

Опция шаблонизатора BH. [Описание](https://ru.bem.info/technology/bh/current/about/#jscls).

##### jsElem

Тип: `Boolean`. По умолчанию: `true`.

Опция шаблонизатора BH. [Описание](https://github.com/bem/bh/blob/master/README.ru.md#jselem).

##### escapeContent

Тип: `Boolean`. По умолчанию: `false`.

Опция шаблонизатора BH. [Описание](https://ru.bem.info/technology/bh/current/about/#escapecontent).

##### clsNobaseMods

Тип: `Boolean`. По умолчанию: `false`.

Опция шаблонизатора BH. [Описание](https://github.com/bem/bh/blob/master/README.ru.md#clsnobasemods).

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

### bemjson-to-html

Предназначен для сборки HTML-файла. Принимает на вход [BEMJSON](https://ru.bem.info/technology/bemjson/current/bemjson/) и скомпилированный `?.bh.js`-файл (результат работы технологий [bh-bundle](#bh-bundle-1) или [bh-commonjs](#bh-commonjs-1)), возвращает HTML.

#### Опции

##### bhFile

Тип: `String`. По умолчанию: `?.bh.js`.

Путь до файла, в котором содержится шаблон, скомпилированный одной из технологий ([bh-bundle](#bh-bundle-1) или [bh-commonjs](#bh-commonjs-1)). Используется для преобразования BEMJSON в HTML.

##### bemjsonFile

Тип: `String`. По умолчанию: `?.bemjson.js`.

Путь до BEMJSON-файла, к которому применится скомпилированный шаблон `?.bh.js` (результат работы технологий [bh-bundle](#bh-bundle-1) или [bh-commonjs](#bh-commonjs-1)) для получения HTML.

##### target

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

Лицензия
--------

© 2014 YANDEX LLC. Код лицензирован [Mozilla Public License 2.0](LICENSE.txt).
