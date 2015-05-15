enb-bh
======

[![NPM version](https://img.shields.io/npm/v/enb-bh.svg?style=flat)](https://www.npmjs.org/package/enb-bh) [![Build Status](https://img.shields.io/travis/enb-bem/enb-bh/master.svg?style=flat&label=tests)](https://travis-ci.org/enb-bem/enb-bh) [![Build status](https://img.shields.io/appveyor/ci/blond/enb-bh.svg?style=flat&label=windows)](https://ci.appveyor.com/project/blond/enb-bh) [![Coverage Status](https://img.shields.io/coveralls/enb-bem/enb-bh.svg?style=flat)](https://coveralls.io/r/enb-bem/enb-bh?branch=master) [![Dependency Status](https://img.shields.io/david/enb-bem/enb-bh.svg?style=flat)](https://david-dm.org/enb-bem/enb-bh)

Поддержка [`bh`](https://github.com/enb-make/bh) для ENB.

Установка:
----------

```sh
$ npm install --save-dev enb-bh
```

Технологии
----------

* [bh-bundle](#bh-bundle)
* [bh-server](#bh-commonjs)
* [bemjson-to-html](#bemjson-to-html)
* [bemjson-to-html-i18n](#bemjson-to-html-i18n)

Для работы модуля требуется зависимость от пакета `enb` версии `0.12.0` или выше.

### bh-bundle

Склеивает *bh*-файлы по deps'ам в виде `?.bh.js` бандла.

Предназначен для сборки как клиентского, так и серверного BH-кода. Предполагается, что в *bh*-файлах не используется `require`.

Поддерживает CommonJS и YModules. Если в исполняемой среде нет ни одной модульной системы, то модуль будет предоставлен в глобальную переменную `bh`.

**Опции**

* *String* **target** — Результирующий таргет. По умолчанию — `?.bh.client.js`.
* *String* **filesTarget** — files-таргет, на основе которого получается список исходных файлов (его предоставляет технология `files`). По умолчанию — `?.files`.
* *String* **sourceSuffixes** — суффиксы файлов, по которым строится `files`-таргет. По умолчанию — `['bh.js']`.
* *Boolean* **sourcemap** — строить карты кода.
* *String|Array* **mimic** — имена переменных для экспорта.
* *String* **jsAttrName** — атрибут блока с параметрами инициализации. По умолчанию — `data-bem`.
* *String* **jsAttrScheme** — Схема данных для параметров инициализации. По умолчанию — `json`. Форматы: `js` — Получаем `return { ... }`. `json` — JSON-формат. Получаем `{ ... }`.
* *String|Boolean* **jsCls** — имя `i-bem` CSS-класса. По умолчанию - `i-bem`. Для того, чтобы класс не добавлялся, следует указать значение `false` или пустую строку.

**Пример**

```javascript
nodeConfig.addTech(require('enb-bh/techs/bh-bundle'));
```

### bh-commonjs

Склеивает *bh*-файлы по deps'ам с помощью набора `require` в виде `?.bh.js`. Предназначен для сборки серверного BH-кода. После сборки требуется наличие всех файлов, подключённых с помощью набора `require`.

**Опции**

* *String* **target** — Результирующий таргет. По умолчанию — `?.bh.js`.
* *String* **filesTarget** — files-таргет, на основе которого получается список исходных файлов (его предоставляет технология `files`). По умолчанию — `?.files`.
* *String* **sourceSuffixes** — суффиксы файлов, по которым строится `files`-таргет. По умолчанию — `['bh.js']`.
* *String|Array* **mimic** — имена переменных для экспорта.
* *String* **jsAttrName** — атрибут блока с параметрами инициализации. По умолчанию — `data-bem`.
* *String* **jsAttrScheme** — Схема данных для параметров инициализации. По умолчанию — `json`. Форматы: `js` — Получаем `return { ... }`. `json` — JSON-формат. Получаем `{ ... }`.
* *String|Boolean* **jsCls** — имя `i-bem` CSS-класса. По умолчанию - `i-bem`. Для того, чтобы класс не добавлялся, следует указать значение `false` или пустую строку.

**Пример**

```javascript
nodeConfig.addTech(require('enb-bh/techs/bh-commonjs'));
```

### bemjson-to-html

Собирает *html*-файл с помощью *bemjson* и *bh*.

**Опции**

* *String* **bhFile** — Исходный BH-файл. По умолчанию — `?.bh.js`.
* *String* **bemjsonFile** — Исходный BEMJSON-файл. По умолчанию — `?.bemjson.js`.
* *String* **target** — Результирующий HTML-файл. По умолчанию — `?.html`.

**Пример**

```javascript
nodeConfig.addTech(require('enb-bh/techs/bemjson-to-html'));
```

### bemjson-to-html-i18n

Собирает *html*-файл с помощью *bemjson*, *bh*, *lang.all* и *lang.{lang}*.

**Опции**

* *String* **bhFile** — Исходный BH-файл. По умолчанию — `?.bh.js`.
* *String* **bemjsonFile** — Исходный BEMJSON-файл. По умолчанию — `?.bemjson.js`.
* *String* **langAllFile** — Исходный langAll-файл. По умолчанию — `?.lang.all.js`.
* *String* **langFile** — Исходный lang-файл. По умолчанию — `?.lang.{lang}.js`. Если параметр lang не указан, берется первый из объявленных в проекте языков
* *String* **target** — Результирующий HTML-файл. По умолчанию — `?.{lang}.html`.

**Пример**

```javascript
nodeConfig.addTech(require('enb-bh/techs/bemjson-to-html-i18n'));
```

Лицензия
--------

© 2014 YANDEX LLC. Код лицензирован [Mozilla Public License 2.0](LICENSE.txt).
