История изменений
=================

1.0.0
-----

**Важно:** ознакомтесь с [руководством по переходу на версию `1.0.0`](MIGRATION-1.md).

### BH 4.x

Реализована поддержка `BH` версии [4.x](https://github.com/bem/bh/releases/tag/v4.0.0) ([#30]):

* Реализована возможность добавлять класс `i-bem` к элементам ([bh#122]).
* Добавлена поддержка CSS-классов без указания принадлежности к блоку ([bh#132]).

### Новая функциональность

* [Подключение сторонних библиотек](README.md#Подключение-сторонних-библиотек) c помощью опции [requires](api.ru.md#requires) ([#64]).
* Сборка шаблонов для исполнения в `Node.js` без сброса `require`-кэша: [`devMode: false`](api.ru.md#devmode) ([#78]).

### Технологии

* [ __*major*__ ] Технологии `bh-client`, `bh-client-module` и `bh-server-include` объединены в одну — [bh-bundle](api.ru.md#bh-bundle) ([#22]).
* [ __*major*__ ] Технология `bh-server` переименована в [bh-commonjs](api.ru.md#bh-commonjs) ([#22]).
* [ __*major*__ ] Технология `html-from-bemjson` переименована в [bemjson-to-html](api.ru.md#bemjson-to-html) ([#52]).
* [ __*major*__ ] Технология `html-from-bemjson-i18n` была удалена. Для работы с локализацией нужно использовать технологии из пакета `enb-bem-i18n` ([#57]).

#### Опции технологий

* В технологию [bh-bundle](api.ru.md#bh-bundle) добавлена опция [scope](api.ru.md#scope) ([#75], [#80]).
* В технологию [bh-commonjs](api.ru.md#bh-commonjs) добавлена опция [devMode](api.ru.md#devmode) ([#78]).
* [ __*major*__ ] В технологии [bh-bundle](api.ru.md#bh-bundle) и [bh-commonjs](api.ru.md#bh-commonjs) добавлена опция [bhOptions](api.ru.md#bhoptions) ([#119]). Ее следует использовать вместо следующих опций, которые были удалены:
  * `jsAttrName`
  * `jsAttrScheme`
  * `clsNobaseMods`
* [ __*major*__ ] Чтобы переопределить модуль `bh`, следует использовать опцию [bhFilename](api.ru.md#bhfilename) вместо `bhFile` ([#59], [#118]).
* [ __*major*__ ] Из технологии `bemjson-to-html` были удалены устаревшие опции: `destTarget` и `bemjsonTarget`. Вместо них следует использовать `target` и `bemjsonFile`, соответственно. ([#85]).

### Зависимости

* [ __*major*__ ] Модуль `bh` больше не является `peer`-зависимостью. Теперь нет возможности повлиять на версию подключаемого модуля `bh`: всегда будет устанавливаться последняя версия `bh@4.x` ([#48]).
* Модуль `enb-source-map@1.5.0` обновлен до версии `1.6.0`.
* Модуль `vow@0.4.9` обновлен до версии `0.4.10`.

### Остальное

* [ __*major*__ ] Теперь каждый шаблон выполняется в изолированной среде ([#75], [#80]).
* Рекомендуется в качестве имени модуля или переменной использовать `BH` вместо `bh` ([#58], [#101]).
* Для переноса строк в Windows теперь используется `\r\n` ([#77]).

0.5.0
-----

### Крупные изменения

* Добавлена опция `mimic` для технологий `bh-server` и `bh-server-include` ([#27]). С её помощью можно имитировать поведение других шаблонизаторов, например, BEMHTML.
* Опция `mimic` для технологий `bh-client` и `bh-client-module` теперь может принимать несколько имён для экспорта ([#28]).

### Engines

* Добавлена поддержка `Node.js` версии `0.12` ([#40]).
* Добавлена поддержка `io.js` ([#40]).

### Windows

* Добавлена поддержка Windows.
* Исправлено подключение модуля `bh` в Windows для технологии `bh-server` ([#42]).

### Тестирование

* Добавлены тесты для всех технологий ([#31]).
* Настроен запуск автотестов с помощью AppVeyor для Windows ([#40]).

### Остальное

* Модуль `vow@0.4.7` обновлён до версии `0.4.9`.

0.4.1
-----

* Исправлена сборка зависимостей в технологии `bh-client-module` ([#24]).
* Модуль `enb-source-map` обновлён до версии `1.5.1`.

0.4.0
-----

* Добавлена опция `mimic` для `bh-client` и `bh-client-module` технологий.

0.3.0
-----

* Добавлена поддержка карт кода ([#19]).
* Добавлена зависимость от модуля `enb-source-map` версии `1.4.1`.
* Модуль `vow` обновлён до версии `0.4.7`.

0.2.3
-----
* Исправлено получение пути до `bh/lib/bh.js` файла ([#11]).
* `vow` обновлён до версии `0.4.5`.

0.2.2
-----

* Обновлена зависимость от BH: 1.0-3.x.

0.2.1
-----

* Обновлена зависимость от BH: 1.x => 2.x ([#8]).

0.2.0
-----

* Добавлена технология `html-from-bemjson-i18n` ([#6]).
* Алиасы для обратной совместимости в технологии `html-from-bemjson` ([#5]).

0.1.1
-----
* Исправлен резолвинг в технологии html-from-bemjson ([#2]).

0.1.0
-----

* Добавлена технология `bh-client`.
* Добавлена технология `bh-client-module`.
* Добавлена технология `bh-server-include`.
* Добавлена технология `bh-server`.
* Добавлена технология `html-from-bemjson`.

[bh#145]: https://github.com/bem/bh/pull/145
[bh#132]: https://github.com/bem/bh/pull/132
[bh#122]: https://github.com/bem/bh/pull/122
[bh#115]: https://github.com/bem/bh/pull/115
[bh#96]: https://github.com/bem/bh/pull/96

[#119]: https://github.com/enb-bem/enb-bh/issues/119
[#118]: https://github.com/enb-bem/enb-bh/issues/118
[#101]: https://github.com/enb-bem/enb-bh/issues/101
[#85]: https://github.com/enb-bem/enb-bh/issues/85
[#80]: https://github.com/enb-bem/enb-bh/issues/80
[#77]: https://github.com/enb-bem/enb-bh/issues/77
[#75]: https://github.com/enb-bem/enb-bh/issues/75
[#78]: https://github.com/enb-bem/enb-bh/issues/78
[#66]: https://github.com/enb-bem/enb-bh/issues/66
[#64]: https://github.com/enb-bem/enb-bh/issues/64
[#59]: https://github.com/enb-bem/enb-bh/issues/59
[#58]: https://github.com/enb-bem/enb-bh/pull/58
[#57]: https://github.com/enb-bem/enb-bh/issues/57
[#52]: https://github.com/enb-bem/enb-bh/issues/52
[#51]: https://github.com/enb-bem/enb-bh/issues/51
[#50]: https://github.com/enb-bem/enb-bh/issues/50
[#49]: https://github.com/enb-bem/enb-bh/issues/49
[#48]: https://github.com/enb-bem/enb-bh/pull/48
[#42]: https://github.com/enb-bem/enb-bh/issues/42
[#40]: https://github.com/enb-bem/enb-bh/pull/40
[#31]: https://github.com/enb-bem/enb-bh/issues/31
[#30]: https://github.com/enb-bem/enb-bh/issues/30
[#28]: https://github.com/enb-bem/enb-bh/pull/28
[#27]: https://github.com/enb-bem/enb-bh/issues/27
[#26]: https://github.com/enb-bem/enb-bh/issues/26
[#24]: https://github.com/enb-bem/enb-bh/pull/24
[#22]: https://github.com/enb-bem/enb-bh/issues/22
[#19]: https://github.com/enb-bem/enb-bh/pull/19
[#11]: https://github.com/enb-bem/enb-bh/issues/11
[#8]: https://github.com/enb-bem/enb-bh/pull/8
[#6]: https://github.com/enb-bem/enb-bh/pull/6
[#5]: https://github.com/enb-bem/enb-bh/pull/5
[#2]: https://github.com/enb-bem/enb-bh/pull/2
