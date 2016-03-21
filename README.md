enb-bh
======

[![NPM version](https://img.shields.io/npm/v/enb-bh.svg?style=flat)](https://www.npmjs.org/package/enb-bh)
[![Build Status](https://img.shields.io/travis/enb/enb-bh/master.svg?style=flat&label=tests)](https://travis-ci.org/enb/enb-bh)
[![Build status](https://img.shields.io/appveyor/ci/blond/enb-bh.svg?style=flat&label=windows)](https://ci.appveyor.com/project/blond/enb-bh)
[![Coverage Status](https://img.shields.io/coveralls/enb/enb-bh.svg?style=flat)](https://coveralls.io/r/enb/enb-bh?branch=master)
[![Dependency Status](https://img.shields.io/david/enb/enb-bh.svg?style=flat)](https://david-dm.org/enb/enb-bh)

Пакет предоставляет набор [ENB](https://ru.bem.info/tools/bem/enb/)-технологий для сборки BH-шаблонов в проектах, построенных по [методологии БЭМ](https://ru.bem.info/method/).

**Технологии пакета `enb-bh`:**

* [bh-bundle](api.ru.md#bh-bundle)
* [bh-commonjs](api.ru.md#bh-commonjs)
* [bemjson-to-html](api.ru.md#bemjson-to-html)

Принципы работы технологий и их API описаны в документе [API технологий](api.ru.md).

**Совместимость:** технологии пакета `enb-bh` поддерживает версию [шаблонизатора BH](https://ru.bem.info/technology/bh/) `4.1.0` и выше.

## Установка

Установите пакет `enb-bh`:

```sh
$ npm install --save-dev enb-bh
```

**Требования:** зависимость от пакета `enb` версии `0.15.0` или выше.

Обзор документа
---------------
* [Быстрый старт](#Быстрый-старт)
* [Работа с технологиями](#Работа-с-технологиями)
  * [Исполнение шаблонов в Node.js](#Исполнение-шаблонов-в-nodejs)
  * [Исполнение шаблонов в браузере](#Исполнение-шаблонов-в-браузере)
  * [Использование шаблонов для сборки HTML](#Использование-шаблонов-для-сборки-html)
* [Особенности работы пакета](#Особенности-работы-пакета)
  * [Подключение сторонних библиотек](#Подключение-сторонних-библиотек)
  * [Мимикрия под BEMHTML](#Мимикрия-под-bemhtml)
  * [Интернационализация](#Интернационализация)
* [Дополнительная документация](#Дополнительная-документация)

Быстрый старт
-------------

Подключите технологию [bh-bundle](api.ru.md#bh-bundle).

```js
var BHBundleTech = require('enb-bh/techs/bh-bundle'),
    FileProvideTech = require('enb/techs/file-provider'),
    bemTechs = require('enb-bem-techs');

 module.exports = function(config) {
     config.node('bundle', function(node) {
         // Получаем FileList
         node.addTechs([
             [FileProvideTech, { target: '?.bemdecl.js' }],
             [bemTechs.levels, { levels: ['blocks'] }],
             [bemTechs.deps],
             [bemTechs.files]
         ]);

         // Создаем BH-файл
         node.addTech(BHBundleTech);
         node.addTarget('?.bh.js');
     });
 };
```

Для сборки HTML используйте технологию [bemjson-to-html](api.ru.md#bemjson-to-html).

```js
var BemjsonToHtmlTech = require('enb-bh/techs/bemjson-to-html'),
    BHCommonJSTech = require('enb-bh/techs/bh-commonjs'),
    FileProvideTech = require('enb/techs/file-provider'),
    bemTechs = require('enb-bem-techs');

module.exports = function(config) {
    config.node('bundle', function(node) {
        // Получаем BEMJSON-файл
        node.addTech([FileProvideTech, { target: '?.bemjson.js' }]);

        // Получаем FileList
        node.addTechs([
            [bemTechs.levels, { levels: ['blocks'] }],
            [bemTechs.bemjsonToBemdecl],
            [bemTechs.deps],
            [bemTechs.files]
        ]);

        // Собираем BH-файл
        node.addTech(BHCommonJSTech);
        node.addTarget('?.bh.js');

        // Создаем HTML-файл
        node.addTech(BemjsonToHtmlTech);
        node.addTarget('?.html');
    });
};
```

Работа с технологиями
---------------------

В БЭМ-методологии шаблоны к каждому блоку хранятся в отдельных файлах с расширением `.bh.js` в директориях блоков. Чтобы использовать шаблоны, необходимо собрать их исходные файлы.

Отдельные файлы с шаблонами (`.bh.js`) собираются в один общий файл (`?.bh.js`) с помощью одной из следующих технологий:

* [bh-bundle](api.ru.md#bh-bundle)
* [bh-commonjs](api.ru.md#bh-commonjs)

Результат — скомпилированный файл `?.bh.js` — может применяться по-разному в зависимости от наличия модульной системы и ее типа в следующих случаях:

* [в Node.js](#Исполнение-шаблонов-в-nodejs)
* [в браузере](#Исполнение-шаблонов-в-браузере)
* [для сборки HTML](#Использование-шаблонов-для-сборки-html)

### Исполнение шаблонов в Node.js

Файл `?.bh.js` подключается как модуль в формате [CommonJS](http://www.commonjs.org/).

```js
var BH = require('bundle.bh.js'); // Путь до скомпилированного файла

BH.apply({ block: 'button' });
```

### Исполнение шаблонов в браузере

Файл `?.bh.js` подключается на страницу как JavaScript-файл.

```html
<script src="bundle.bh.js"></script>
```

В браузере исполнение шаблонов зависит от наличия модульной системы:

* **Без модульной системы**

  Шаблоны доступны из глобальной переменной `BH`.

  ```js
  BH.apply({ block: 'button' });
  ```

* **С модульной системой YModules**

  Шаблоны доступны из модульной системы ([YModules](https://ru.bem.info/tools/bem/modules/)):

  ```js
  modules.require(['BH'], function(BH) {
      BH.apply({ block: 'button' })
  });
  ```

### Использование шаблонов для сборки HTML

HTML – результат применения скомпилированного шаблона к указанному BEMJSON-файлу.

Сборка HTML (файл `?.html`) с помощью технологий `enb-bh` проходит в два этапа:

1. Файл `?.bh.js` собирается с помощью одной из технологий [bh-bundle](api.ru.md#bh-bundle) или [bh-commonjs](api.ru.md#bh-commonjs).
2. [BEMJSON](https://ru.bem.info/technology/bemjson/) и скомпилированный `?.bh.js`-файл обрабатываются с помощью технологии [bemjson-to-html](#bemjson-to-html), которая возвращает HTML-файл (?.html).

Особенности работы пакета
-------------------------

### Подключение сторонних библиотек

Технологии [bh-bundle](api.ru.md#bh-bundle) и [bh-commonjs](api.ru.md#bh-commonjs) поддерживают возможность подключения сторонних библиотек.

Способы подключения для каждой технологии отличаются.

#### bh-bundle

Технология `bh-bundle` позволяет подключать библиотеки как глобально, так и для разных модульных систем с помощью опции [requires](api.ru.md#requires).

Для подключения укажите название библиотеки и в зависимости от используемой модульной системы:

* имя глобальной переменной;
* имя модуля из YModules;
* путь к модулю для CommonJS.

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

Не обязательно указывать все модульные системы для подключения библиотеки.

Например,  указать зависимости глобально для всех модульных систем. В этом случае модуль всегда будет передаваться из глобальной переменной, даже если в среде исполнения будет использоваться модульная система.

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
            commonJS: 'moment'
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

#### bh-commonjs

Технология `bh-commonjs` позволяет подключать библиотеки в шаблоне с помощью `require`:

```js
var lib = require('path/to/module');  // Путь до библиотеки
```

### Мимикрия под BEMHTML

БЭМ-платформа поддерживает шаблонизаторы [BH](https://ru.bem.info/technology/bh/current/about/) и [BEMHTML](https://ru.bem.info/technology/bemhtml/current/rationale/), которые преобразуют [BEMJSON](https://ru.bem.info/technology/bemjson/current/bemjson/) в HTML.

Для возможности писать JavaScript-код, совместимый с обоими шаблонизаторами, используется опция [mimic](api.ru.md#mimic). Она позволяет использовать имена переменных BEMHTML, но по факту выполнять шаблоны BH.

### Интернационализация

Базовая реализация BH-технологий не поддерживает интернационализацию (i18n).

Чтобы использовать i18n в шаблонах, следует подключить модуль `BEM.I18N` по аналогии с другими [сторонними библиотеками](#Подключение-сторонних-библиотек).

> `BEM.I18N` — библиотека для интернационализации блоков. Ядро находится в `keyset`-файлах в одной из базовых библиотек блоков:
* [bem-core](https://github.com/bem/bem-core/blob/v2/common.blocks/i-bem/__i18n/i-bem__i18n.i18n/core.js)
* [bem-bl](https://github.com/bem/bem-bl/blob/support/2.x/blocks-common/i-bem/__i18n/i-bem__i18n.i18n/core.js)

После подключения `BEM.I18N` можно использовать в шаблонах из пространства имен `bh.lib`:

```js
bh.match('block', function (ctx) {
    ctx.content({
        elem: 'tooltip',
        content: bh.lib.i18n('block', 'tooltip');
    });
});
```

Дополнительная документация
---------------------------

* [Шаблонизатор BH](https://ru.bem.info/technology/bh/current/about/)
* [API технологий](api.ru.md)

Лицензия
--------

© 2014 YANDEX LLC. Код лицензирован [Mozilla Public License 2.0](LICENSE.txt).
