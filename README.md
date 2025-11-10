Para todo usuario que este leyendo este codigo, aqui estan los pasos a seguir para desplegar este proyecto en localhost:

1- Descargar el .zip desde GitHub
2- Instalar las dependencias (esto se hace con el comando: npm i)
3- Tener en cuenta que se debe tener instalado en la computadora los siguientes:
- Node: Dentro de la consola de PowerShell, escribimos: winget install OpenJS.NodeJS.LTS -s winget
- npm.ps1: Si al querer iniciar el proyecto nos dice el siguiente error: npm : No se puede cargar el archivo C:\Program Files\nodejs\npm.ps1 porque la ejecución de scripts está deshabilitada en este sistema.
En la consola de PowerShell, escribi: Set-ExecutionPolicy RemoteSigned -Scope CurrentUser, esto habilita a tu usuario de forma permamente 

Como recomendacion tambien instalar Git (desde la web)
