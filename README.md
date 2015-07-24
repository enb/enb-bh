enb-bh
======

[![NPM version](https://img.shields.io/npm/v/enb-bh.svg?style=flat)](https://www.npmjs.org/package/enb-bh)
[![Build Status](https://img.shields.io/travis/enb-bem/enb-bh/master.svg?style=flat&label=tests)](https://travis-ci.org/enb-bem/enb-bh)
[![Build status](https://img.shields.io/appveyor/ci/blond/enb-bh.svg?style=flat&label=windows)](https://ci.appveyor.com/project/blond/enb-bh)
[![Coverage Status](https://img.shields.io/coveralls/enb-bem/enb-bh.svg?style=flat)](https://coveralls.io/r/enb-bem/enb-bh?branch=master)
[![Dependency Status](https://img.shields.io/david/enb-bem/enb-bh.svg?style=flat)](https://david-dm.org/enb-bem/enb-bh)

Пакет предоставляет набор [ENB](https://ru.bem.info/tools/bem/enb-bem/)-технологий для сборки BH-шаблонов в проектах, построенных по [методологии БЭМ](https://ru.bem.info/method/).

**Технологии пакета `enb-bh`:**

* [bh-bundle](api.ru.md#bh-bundle)
* [bh-commonjs](api.ru.md#bh-commonjs)
* [bemjson-to-html](api.ru.md#bemjson-to-html)

Принципы работы технологий и их API описаны в документе [Использование `enb-bh`](api.ru.md).

**Совместимость:** технологии пакета `enb-bh` поддерживает версию [шаблонизатора BH](https://ru.bem.info/technology/bh/) `4.1.0` и выше.

## Обзор документа

* [Работа с технологиями](#Работа-с-технологиями)
    * [Исполнение шаблонов в Node.js](#Исполнение-шаблонов-в-nodejs)
    * [Исполнение шаблонов в браузере](#Исполнение-шаблонов-в-браузере)
    * [Использование шаблонов для сборки HTML](#Использование-шаблонов-для-сборки-html)
* [Особенности работы пакета](#Особенности-работы-пакета)
    * [Подключение сторонних библиотек](#Подключение-сторонних-библиотек)
    * [Мимикрия под BEMHTML](#Мимикрия-под-bemhtml)
* [Как начать использовать](#Как-начать-использовать)

## Работа с технологиями

В БЭМ-методологии шаблоны к каждому блоку хранятся в отдельных файлах с расширением `.bh.js` в директориях блоков. Чтобы использовать шаблоны, необходимо собрать их исходные файлы.

Отдельные файлы с шаблонами (`.bh.js`) собираются в один общий файл (`?.bh.js`) с помощью одной из следующих технологий:

* [bh-bundle](api.ru.md#bh-bundle)
* [bh-commonjs](api.ru.md#bh-commonjs)

Результат работы технологий [bh-bundle](api.ru.md#bh-bundle) или [bh-commonjs](api.ru.md#bh-commonjs) — это скомпилированный файл `?.bh.js`. Способы его использования зависят от наличия модульной системы и ее типа:

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

В браузере исполнение шаблонов зависит от наличия модульной системы.

#### Без модульной системы

Шаблоны доступны из глобальной переменной `BH`.

```js
BH.apply({ block: 'button' });
```

#### С модульной системой YModules

Шаблоны доступны из модульной системы ([YModules](https://ru.bem.info/tools/bem/modules/)):

```js
modules.require(['BH'], function(BH) {
    BH.apply({ block: 'button' })
});
```

### Использование шаблонов для сборки HTML

Сборка HTML (файл `?.html`) с помощью технологий `enb-bh` проходит в два этапа:

1. Технологии [bh-bundle](api.ru.md#bh-bundle) или [bh-commonjs](api.ru.md#bh-commonjs) собирают общий `?.bh.js`-файл.
2. Технология [bemjson-to-html](#bemjson-to-html) принимает на вход [BEMJSON](https://ru.bem.info/technology/bemjson/current/bemjson/) и скомпилированный `?.bh.js`-файл, возвращает `?.html`-файл.

HTML – результат применения скомпилированного шаблона к указанному BEMJSON-файлу.

<a name="libs-add"></a>
## Особенности работы пакета

### Подключение сторонних библиотек

Технологии [bh-bundle](api.ru.md#bh-bundle) и [bh-commonjs](api.ru.md#bh-commonjs) поддерживают возможность подключения сторонних библиотек.

Способы подключения для каждой технологии отличаются.

#### bh-bundle

Технология `bh-bundle` позволяет подключать библиотеки как глобально, так и для разных модульных систем с помощью опции [requires](api.ru.md#requires).

Для подключения укажите название библиотеки и имя модуля или пути к нему для модульных систем.

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

#### bh-commonjs

В технологии `bh-commonjs` в шаблоне можно подключать библиотеки с помощью `require`:

```js
var lib = require('path/to/module'); // Путь до библиотеки
```

### Мимикрия под BEMHTML

БЭМ-платформа поддерживает два шаблонизатора: [BH](https://ru.bem.info/technology/bh/current/about/) и [BEMHTML](https://ru.bem.info/technology/bemhtml/current/rationale/), которые решают одну и ту же задачу: преобразуют [BEMJSON](https://ru.bem.info/technology/bemjson/current/bemjson/) в HTML.

Для возможности писать JavaScript-код, совместимый с обоими шаблонизаторами, используется опция [mimic](api.ru.md#opt-mimic). Она позволяет использовать имена переменных BEMHTML, но по факту выполнять шаблоны BH.

## Как начать использовать?

Установите пакет `enb-bh`:

```sh
$ npm install --save-dev enb-bh
```

**Требования:** зависимость от пакета `enb` версии `0.12.0` или выше.

Выберите подходящую технологию для сборки шаблонов: [bh-bundle](api.ru.md#bh-bundle) или [bh-commonjs](api.ru.md#bh-commonjs). Выбор зависит от необходимой среды исполнения шаблонов.

Для сборки HTML используйте технологию [bemjson-to-html](api.ru.md#bemjson-to-html).

Принципы работы технологий и их API описаны в документе [Использование технологий пакета `enb-bh`](api.ru.md).

Лицензия
--------

© 2014 YANDEX LLC. Код лицензирован [Mozilla Public License 2.0](LICENSE.txt).
