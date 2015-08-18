Руководство по переходу на версию `1.0.0`
=========================================

* [BH 4.0](#bh-40)
* [Технологии](#Технологии)
* [Зависимости](#Зависимости)

BH 4.0
------

В шаблонизаторе BH, начиная с версии `4.0`, произошли следующие изменения:

* [Добавление класса i-bem](#i-bem)
* [Поддержка пустых атрибутов](#Пустые-атрибуты)
* [Обход БЭМ-дерева](#Обход-бэм-дерева)
* [Поддержка BEM.I18N](#bemi18n)

### i-bem

CSS-класс `i-bem` теперь добавляется не только к блокам, но и к элементам.

Чтобы отключить добавление класса к элементам, следует использовать опцию [bhOptions](api.ru.md#bhoptions) со значением `{ jsElem: false }`.

### Пустые атрибуты

> Пустой атрибут — это сокращенное представление булевого атрибута.

Изменился генерируемый HTML-код для булевых BEMJSON-атрибутов со значением `true`.

```js
{
    block: 'button',
    attrs: {
        disabled: true
    }
}
```

**Было:**

```html
<div class="button i-bem" disabled="disabled"></div>
```

**Стало:**

```html
<div class="button i-bem" disabled></div>
```

### Обход БЭМ-дерева

Текущий узел дерева (аргумент `json` метода `match`) теперь возвращается в стандартном BEMJSON-формате.
Вместо полей `blockName`, `blockMods` и `mods` следует использовать `block`, `mods` и `elemMods`, соответственно.

**Было:**

```js
bh.match('button', function (ctx, json) {
    json.blockName // имя блока
    json.blockMods // объект модификаторов блока
    json.mods      // объект модификаторов элемента
});
```

**Стало:**

```js
bh.match('button', function (ctx, json) {
    json.block      // имя блока
    json.mods       // объект модификаторов блока
    json.elemMods   // объект модификаторов элемента
});
```

### BEM.I18N

Модуль `BEM.I18N` не доступен из `bh.lib.i18n` по умолчанию. Теперь его нужно подключать так же, как и любые другие [сторонние библиотеки](README.md#Подключение-сторонних-библиотек). Подробнее об этом читайте в разделе [Интернационализация](README.md#Интернационализация).

При использовании технологии [bh-bundle](api.ru.md#bh-bundle) следует воспользоваться опцией [requires](api.ru.md#requires):

```js
var BHBundleTech = require('enb-bh/techs/bh-bundle');

node.addTech([BHBundleTech, {
    requires: {
        i18n: { globals: 'BEM.I18N' }
    }
}]);
```

Для технологии [bh-commonjs](api.ru.md#bh-commonjs) следует оперировать CommonJS-модулями и предоставить `BEM.I18N` в пространство имен `bh.lib` самостоятельно:

```js
var BEM = { I18N: require('path/to/i18n-module') },
    BH = require('bundle.bh.js');

BH.lib.i18n = BEM.I18N;

module.exports = BH;
```

Технологии
----------

Технологии в пакете можно разделить на две группы:

* [для сборки BH-шаблонов](#Сборка-bh-шаблонов).
* [для получения HTML-файла](#Получение-html-файла).

### Сборка BH-шаблонов

1. Технологии `bh-client`, `bh-client-module` и `bh-server-include` объединены в одну — [bh-bundle](api.ru.md#bh-bundle).
2. Технология `bh-server` переименована в [bh-commonjs](api.ru.md#bh-commonjs).

#### Как выбрать технологию?

Выбор технологии зависит от предполагаемой среды исполнения скомпилированных шаблонов:

* [в Node.js](#Исполнение-шаблонов-в-nodejs)
* [в браузере](#Исполнение-шаблонов-в-браузере)
* [в любой среде](#Исполнение-шаблонов-и-в-браузере)

> Про использование шаблонов читайте в разделе «[Работа с технологиями](README.md#Работа-с-технологиями)»

##### Исполнение шаблонов в Node.js

Если шаблонизировать нужно исключительно в `Node.js`, то вместо `bh-server` можно выбрать технологию [bh-commonjs](api.ru.md#bh-commonjs).

##### Исполнение шаблонов в браузере

Для шаблонизации в браузере вместо `bh-client` или `bh-client-module` следует использовать [bh-bundle](api.ru.md#bh-bundle) вне зависимости от наличия модульной системы.

##### Исполнение шаблонов и в браузере, и в Node.js

Чтобы исполнять одни и те же шаблоны как в браузере, так и в Node.js, нужно использовать [bh-bundle](api.ru.md#bh-bundle) технологию.

**Важно:** шаблоны и подключаемые библиотеки не должны содержать кода, специфичного для какой-то конкретной среды исполнения.

#### Настройка BH

Для настройки шаблонизатора BH вместо опций `jsAttrName`, `jsAttrScheme` и `clsNobaseMods` следует использовать опцию [bhOptions](api.ru.md#bhoptions).

**Было:**

```js
{
    jsAttrName: 'data-bem',
    jsAttrScheme: 'json',
    clsNobaseMods: false
}
```

**Стало:**

```js
{
    bhOptions: {
        jsAttrName: 'data-bem',
        jsAttrScheme: 'json',
        clsNobaseMods: false
    }
}
```

#### Изолированность шаблонов

Раньше все шаблоны, собранные с помощью технологий `bh-client`, `bh-client-module` или `bh-server-include`, выполнялись в одной области видимости.

**Шаблон 1:**

```js
var text = 'Hello!';

bh.match('text-1', function (ctx) {
    ctx.content(text);
});
```

**Шаблон 2:**

```js
bh.match('text-2', function (ctx) {
    // Переменная `text` будет доступна, контент — 'Hello!'
    ctx.content(text);
});
```

В технологии [bh-bundle](api.ru.md#bh-bundle) каждый шаблон изолирован от всех других.

**Шаблон 1:**

```js
var text = 'Hello!';

bh.match('text-1', function (ctx) {
    ctx.content(text);
});
```

**Шаблон 2:**

```js
bh.match('text-2', function (ctx) {
    ctx.content(text); // Получим ошибку 'ReferenceError: text is not defined'
});
```

Для выполнения шаблонов в общей области видимости нужно использовать опцию [scope](api.ru.md#scope) cо значением `global`.

### Получение HTML-файла

Технология `html-from-bemjson` переименована в [bemjson-to-html](api.ru.md#bemjson-to-html).

Вместо опции `destTarget` следует использовать [target](api.ru.md#target-2), а вместо `bemjsonTarget` — [bemjsonFile](api.ru.md#bemjsonfile).

**Было:**

```js
var HtmlFromBemjsonTech = require('enb-bh/techs/html-from-bemjson');

node.addTech([HtmlFromBemjsonTech, {
    destTarget: '?.html',
    bemjsonTarget: '?.bemjson.js'
}]);
```

**Стало:**

```js
var BemjsonToHtmlTech = require('enb-bh/techs/bemjson-to-html');

node.addTech([BemjsonToHtmlTech, {
    target: '?.html',
    bemjsonFile: '?.bemjson.js'
}]);
```

Технология `bemjson-to-html-i18n` была удалена. Для получения HTML на основе BEMJSON
и локализационных файлов следует использовать технологии из пакета `enb-bem-i18n`.

Зависимости
-----------

Раньше в `package.json` нужно было указывать версию пакета `bh`, т.к. `bh` являлся peer-зависимостью для `enb-bh`.

```json
"dependencies": {
  "bh": "3.3.0",
  "enb": "0.16.0",
  "enb-bh": "0.5.0"
}
```

Теперь этого делать не нужно: всегда будет устанавливаться последняя версия `bh@4.x`.

```json
"dependencies": {
  "enb": "0.16.0",
  "enb-bh": "1.0.0"
}
```
