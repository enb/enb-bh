История изменений
=================

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

### Остальные изменения

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

[#42]: https://github.com/enb-bem/enb-bh/issues/42
[#40]: https://github.com/enb-bem/enb-bh/issues/40
[#31]: https://github.com/enb-bem/enb-bh/issues/31
[#28]: https://github.com/enb-bem/enb-bh/issues/28
[#27]: https://github.com/enb-bem/enb-bh/issues/27
[#24]: https://github.com/enb-bem/enb-bh/issues/24
[#19]: https://github.com/enb-bem/enb-bh/issues/19
[#11]: https://github.com/enb-bem/enb-bh/issues/11
[#8]: https://github.com/enb-bem/enb-bh/issues/8
[#6]: https://github.com/enb-bem/enb-bh/issues/6
[#5]: https://github.com/enb-bem/enb-bh/issues/5
[#2]: https://github.com/enb-bem/enb-bh/issues/2
