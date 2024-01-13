# tradealize_server

Pseucodógico (ya hay muchas funciones desarrolladas)

El usuario sube un archivo que es una imagen
La imagen se guarda en un bucket de AWS y regresa un link (POST /api/files)
El link se pasa junto con master prompt a un chat completion usando gpt-4-vision - getChatCompletion()
El servidor responde OK (200)
El cliente muestra un status de "analizando"

Cuando OpenAI termina de analizar, envia el resultado por un websocket - sendEvent
El cliente recibe el resultado y notifica al usuario
El usuario consulta el resultado generado por OpenAI
El usuario puede hacer más preguntas sobre el resultado, se agregan a su conversacion
