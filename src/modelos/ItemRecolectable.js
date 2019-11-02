class ItemRecolectable extends Modelo{

    constructor(x, y) {
        super(imagenes.icono_recolectable, x, y);

        this.aMover = new Animacion(imagenes.recolectable,
            this.ancho, this.alto, 1, 8);
        // Ref a la animación actual
        this.animacion = this.aMover;
    }

    actualizar (){
        // Actualizar animación
        this.animacion.actualizar();
    }

    dibujar (scrollX){
        scrollX = scrollX || 0;
        this.animacion.dibujar(this.x - scrollX, this.y);
    }



}