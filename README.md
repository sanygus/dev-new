#### `http://<ip>:3000/<function>?[<param>=<value>&]`

Каждый успешный ответ содержит JSON объект или файл. В JSON объекте всегда присутствует поле `ok` (true/false). Если false - в ответе будет код ошибки и текстовое описание.


## Functions
##### `shootPhoto`
Снимает фото. После успешного выполнения (без параметров) возвращется файл .jpg. Если возникла ошибка, возвращается JSON объект с описанием ошибки.

##### `shootVideo`
Параметры:
| name | type | required | default | description |
|---|---|---|---|---|
| duration | int | yes || Длительность видео в секундах. Должно быть > 0 |
Снимает видео длительностью *duration* секунд и отдаёт файл (h264) в ответ. При неудаче JSON с описанием ошибки.
Пример: `/shootVideo?duration=30`

##### `startStream`
Запускает видео трансляцию. Возвращает JSON объект (успех/неудача). Доступ по `:8080/stream/video.mjpeg` (page `:8080/stream`)

##### `stopStream`
Останавливает видео трансляцию. Возвращает JSON объект (успех/неудача).

##### `measureSensors`
Считывает значения датчиков отдаёт JSON объект, содержащий значения или ошибку.

## Scripts
##### `setScript`
Параметры:
| name | type | required | default | description |
|---|---|---|---|---|
| script | string | yes || Список **команд** построчно |

**Команды**:
1. Время начала (YYYY-MM-DD HH:MM:SS)
2. Периодичность(int, required) (interval sec)
3. Функция
4. Назначение результата - callback URL - будет вызван методом POST с содержанием результата

Пример команды: `"2017-06-20 17:15:00" "0" "measureSensors" "http://myserver/callbacks"`

##### `getScript`
Возвращает текущий скрипт

##### `clearStript`
Очищает текущий скрипт и останавливает его выполнение

## State
##### `state`
Возвращает уровень заряда, режим работы

## ...