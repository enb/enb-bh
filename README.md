enb-bh [![NPM version](https://badge.fury.io/js/enb-bh.svg)](http://badge.fury.io/js/enb-bh) [![Build Status](https://travis-ci.org/enb-make/enb-bh.svg?branch=master)](https://travis-ci.org/enb-make/enb-bh) [![Dependency Status](https://gemnasium.com/enb-make/enb-bh.svg)](https://gemnasium.com/enb-make/enb-bh)
======

Поддержка [`bh`](https://github.com/enb-make/bh) для ENB.

Установка:
----------

```
npm install --save-dev enb-bh
```

Для работы модуля требуется зависимость от пакета enb версии 0.12.0 или выше.

bh-client
=========

Склеивает `bh`-файлы по deps'ам в виде `?.bh.client.js`. Предназначен для сборки клиентского BH-кода.

**Опции**

* *String* **target** — Результирующий таргет. По умолчанию — `?.bh.client.js`.
* *String* **filesTarget** — files-таргет, на основе которого получается список исходных файлов (его предоставляет технология `files`). По умолчанию — `?.files`.
* *String* **sourceSuffixes** — суффиксы файлов, по которым строится `files`-таргет. По умолчанию — `['bh']`.
* *String* **jsAttrName** — атрибут блока с параметрами инициализации. По умолчанию — `onclick`.
* *String* **jsAttrScheme** — Cхема данных для параметров инициализации. По умолчанию — `js`. Форматы: `js` — Получаем `return { ... }`. `json` — JSON-формат. Получаем `{ ... }`.

**Пример**

```javascript
nodeConfig.addTech(require('enb-bh/techs/bh-client'));
```

bh-client-module
================

Склеивает `bh`-файлы по deps'ам в виде `?.bh.client.js`. Предназначен для сборки клиентского BH-кода. Использует модульную обертку.

**Опции**

* *String* **target** — Результирующий таргет. По умолчанию — `?.bh.client.js`.
* *String* **filesTarget** — files-таргет, на основе которого получается список исходных файлов (его предоставляет технология `files`). По умолчанию — `?.files`.
* *String* **sourceSuffixes** — суффиксы файлов, по которым строится `files`-таргет. По умолчанию — `['bh']`.
* *String* **jsAttrName** — атрибут блока с параметрами инициализации. По умолчанию — `onclick`.
* *String* **jsAttrScheme** — Cхема данных для параметров инициализации. По умолчанию — `js`. Форматы: `js` — Получаем `return { ... }`. `json` — JSON-формат. Получаем `{ ... }`.

**Пример**

```javascript
nodeConfig.addTech(require('enb-bh/techs/bh-client-module'));
```

bh-server
=========

Склеивает *bh*-файлы по deps'ам с помощью набора `require` в виде `?.bh.js`. Предназначен для сборки серверного BH-кода. После сборки требуется наличия всех файлов, подключённых с помощью набора `require`.

**Опции**

* *String* **target** — Результирующий таргет. По умолчанию — `?.bh.js`.
* *String* **filesTarget** — files-таргет, на основе которого получается список исходных файлов (его предоставляет технология `files`). По умолчанию — `?.files`.
* *String* **sourceSuffixes** — суффиксы файлов, по которым строится `files`-таргет. По умолчанию — `['bh']`.
* *String* **jsAttrName** — атрибут блока с параметрами инициализации. По умолчанию — `onclick`.
* *String* **jsAttrScheme** — Cхема данных для параметров инициализации. По умолчанию — `js`. Форматы: `js` — Получаем `return { ... }`. `json` — JSON-формат. Получаем `{ ... }`.

***Пример**
```javascript
nodeConfig.addTech(require('enb-bh/techs/bh-server'));
```

bh-server-include
=================

Склеивает `bh`-файлы по deps'ам в виде `?.bh.js`. Предназначен для сборки серверного BH-кода. Предполагается, что в `bh`-файлах не используется `require`.

**Опции**

* *String* **target** — Результирующий таргет. По умолчанию — `?.bh.js`.
* *String* **filesTarget** — files-таргет, на основе которого получается список исходных файлов (его предоставляет технология `files`). По умолчанию — `?.files`.
* *String* **sourceSuffixes** — суффиксы файлов, по которым строится `files`-таргет. По умолчанию — `['bh']`.
* *String* **jsAttrName** — атрибут блока с параметрами инициализации. По умолчанию — `onclick`.
* *String* **jsAttrScheme** — Cхема данных для параметров инициализации. По умолчанию — `js`. Форматы: `js` — Получаем `return { ... }`. `json` — JSON-формат. Получаем `{ ... }`.

**Пример**

```javascript
nodeConfig.addTech(require('enb-bh/techs/bh-server-include'));
```

html-from-bemjson
=================

Собирает *html*-файл с помощью *bemjson* и *bh*.

**Опции**

* *String* **bhTarget** — Исходный BH-файл. По умолчанию — `?.bh.js`.
* *String* **bemjsonTarget** — Исходный BEMJSON-файл. По умолчанию — `?.bemjson.js`.
* *String* **destTarget** — Результирующий HTML-файл. По умолчанию — `?.html`.

**Пример**
```javascript
nodeConfig.addTech(require('enb-bh/techs/html-from-bemjson'));
```

html-from-bemjson-i18n
======================

Собирает *html*-файл с помощью *bemjson*, *bh*, *lang.all* и *lang.{lang}*.

**Опции**

* *String* **bhFile** — Исходный BH-файл. По умолчанию — `?.bh.js`.
* *String* **bemjsonFile** — Исходный BEMJSON-файл. По умолчанию — `?.bemjson.js`.
* *String* **langAllFile** — Исходный langAll-файл. По умолчанию — `?.lang.all.js`.
* *String* **langFile** — Исходный lang-файл. По умолчанию — `?.lang.{lang}.js`. Если параметр lang не указан, берется первый из объявленных в проекте языков
* *String* **target** — Результирующий HTML-файл. По умолчанию — `?.{lang}.html`.

**Пример**
```javascript
nodeConfig.addTech(require('enb-bh/techs/html-from-bemjson-i18n'));
```

История изменений
-----------------

История изменений на [отдельной странице](/CHANGELOG.md).

Разработка
----------
Руководство на [отдельной странице](/CONTRIBUTION.md).

Запуск тестов
-------------
```
$ npm test
```
