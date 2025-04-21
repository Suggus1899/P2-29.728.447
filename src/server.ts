import app from "./app";

const PORT = process.env.PORT || 3000; //Puerto en donde se ejecutara la apliacion

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`); //Mensaje que indica que el servidor esta corriendo
});
