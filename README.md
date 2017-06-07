#### `http://<ip>:3000/<method>?<params>`

Методы возвращают JSON объект (иногда другое - в зависимости от параметров). Каждый ответ (JSON) содержит поле `ok` (true/false). Если false - в ответе будет код ошибки и текстовое описание.


## Functions
### Camera
#### `shootPhoto`
Снимает фото и сохраняет в *storage*. Для получения файла не ранее чем через 5 сек вызвать **getPhoto**

#### `shootVideo`
+ duration (integer, required) - длительность видео в секундах

Снимает видео длительностью *duration* секунд и сохраняет в *storage*. Для получения файла не ранее чем через *duration* сек вызвать **getVideo**
Пример: `/shootVideo?duration=30`


#### `startStream`
Запускает видео трансляцию. Доступ по `:8080/stream/video.mjpeg` (page `:8080/stream`)

#### `stopStream`
Останавливает видео трансляцию


### Sensors
#### `measureSensors`
Считывает значения датчиков и сохраняет их в *storage*. При успешеном ответе результат доступен сразу (`getSensors`)


### Storage
#### `getPhoto`
Возвращает файл фото (jpg) из *storage* (если фото доступно)

#### `getVideo`
Возвращает файл видео (h264) из *storage* (если видео доступно)

#### `getSensors`
Возвращает значения датчиков (text JSON) из *storage* (если значения доступны)

## Scripts
#### `setScript`
+ script (string, required) - list of **commands**

**Command**:
1. Время начала (YYYY-MM-DD HH:MM:SS)
2. Периодичность(int, required) (interval sec)
3. Функция
Пример: `"2017-06-20 17:15:00" "0" "measureSensors"`

#### `getScript`
Возвращает текущий скрипт

#### `clearStript`
Очищает текущий скрипт и останавливает его выполнение

## State
#### `state`
Возвращает уровень заряда, режим работы

## ...